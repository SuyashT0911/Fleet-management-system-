import React, { useState, useEffect, useCallback } from 'react';
import { FiTruck, FiUsers, FiMapPin, FiDollarSign, FiTool, FiDroplet, FiNavigation, FiClock, FiAlertCircle, FiActivity, FiBell, FiX, FiCheck, FiCheckCircle, FiChevronRight, FiStar, FiUserCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

const iconForType = (type) => {
  const map = { trip: <FiNavigation />, vehicle: <FiTruck />, driver: <FiUsers />, user: <FiUserCheck />, fuel: <FiDroplet />, maintenance: <FiTool />, incident: <FiAlertCircle />, feedback: <FiStar />, payment: <FiDollarSign /> };
  return map[type] || <FiActivity />;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
const tooltipStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [liveTrips, setLiveTrips] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tripChartData, setTripChartData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes, liveRes, activityRes, unreadRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/live-trips'),
        api.get('/dashboard/recent-activity'),
        api.get('/notifications/unread-count'),
      ]);
      setStats(statsRes.data);
      setLiveTrips(liveRes.data);
      setActivity(activityRes.data);
      setUnreadCount(unreadRes.data.count || 0);
    } catch (err) { console.error('Dashboard fetch error', err); }
    finally { setLoading(false); }
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      const [tripsRes, vehiclesRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
      ]);
      // Process trip data by month
      const trips = tripsRes.data;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const monthMap = {};
      trips.forEach(t => {
        if (!t.startTime) return;
        const d = new Date(t.startTime);
        if (d.getFullYear() !== currentYear || d.getMonth() > currentMonth) return;
        
        const key = months[d.getMonth()];
        if (!monthMap[key]) monthMap[key] = { month: key, completed: 0, ongoing: 0, scheduled: 0 };
        if (t.tripStatus === 'completed') monthMap[key].completed++;
        else if (t.tripStatus === 'ongoing') monthMap[key].ongoing++;
        else monthMap[key].scheduled++;
      });
      // Map only months up to now
      const chartData = months.slice(0, currentMonth + 1).map(m => {
        return monthMap[m] || { month: m, completed: 0, ongoing: 0, scheduled: 0 };
      });
      setTripChartData(chartData);

      // Process vehicle types
      const vehicles = vehiclesRes.data;
      const typeMap = {};
      vehicles.forEach(v => {
        const type = v.vehicleType?.typeName || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      setVehicleTypeData(Object.entries(typeMap).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })));
    } catch (err) { console.error('Chart data fetch error', err); }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchChartData();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchChartData]);

  const openNotifPanel = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setShowNotifPanel(true);
    } catch (err) { console.error('Notification fetch error', err); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const markOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const kpis = [
    { label: 'Total Vehicles', value: stats?.totalVehicles || 0, icon: <FiTruck />, bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
    { label: 'Active Drivers', value: stats?.activeDrivers || 0, icon: <FiUsers />, bg: 'rgba(6,182,212,0.12)', color: '#06b6d4' },
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: <FiNavigation />, bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    { label: 'Active Trips', value: stats?.ongoingTrips || 0, icon: <FiMapPin />, bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    { label: 'Fuel Costs', value: `₹${(stats?.totalFuelCost || 0).toLocaleString()}`, icon: <FiDroplet />, bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    { label: 'Maintenance Due', value: stats?.pendingMaintenance || 0, icon: <FiTool />, bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: <FiUserCheck />, bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
  ];

  return (
    <div className="page-content">
      {/* Header with notification bell */}
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Real-time fleet operations overview</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="tab-group">
            <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
              <FiActivity /> Overview
            </button>
            <button className={`tab-btn ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
              <span className="live-dot" /> Live Trips ({liveTrips.length})
            </button>
            <button className={`tab-btn ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>
              <FiStar /> Reviews
            </button>
          </div>
          <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }} onClick={openNotifPanel} title="Notifications">
            <FiBell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div className="kpi-info">
              <h3>{kpi.label}</h3>
              <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Trip Distribution by Month</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tripChartData.length > 0 ? tripChartData : [{ month: 'No Data', completed: 0, ongoing: 0, scheduled: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="completed" fill="#10b981" radius={[6,6,0,0]} name="Completed" />
                  <Bar dataKey="ongoing" fill="#f59e0b" radius={[6,6,0,0]} name="Ongoing" />
                  <Bar dataKey="scheduled" fill="#6366f1" radius={[6,6,0,0]} name="Scheduled" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Fleet Composition</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={vehicleTypeData.length > 0 ? vehicleTypeData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={5} dataKey="value">
                    {(vehicleTypeData.length > 0 ? vehicleTypeData : [{ color: '#e2e8f0' }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 13 }} formatter={(v) => <span style={{ color: '#475569' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>
                <FiActivity style={{ verticalAlign: 'middle', marginRight: 8, color: '#6366f1' }} />
                Recent Activity
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={openNotifPanel}>View All</button>
            </div>
            <div className="activity-list">
              {activity.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No recent activity. Operations will appear here in real-time.</p>}
              {activity.slice(0, 10).map((a, i) => (
                <div key={a.notificationId || i} className="activity-item" onClick={() => setSelectedNotif(a)} style={{ cursor: 'pointer' }}>
                  <div className={`activity-dot ${a.type || 'info'}`} />
                  <div className="activity-content">
                    <div className="activity-action">{a.title}</div>
                    <div className="activity-detail">{a.message}</div>
                  </div>
                  <span className="activity-time">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'live' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              <span className="live-dot" /> Active Trips ({liveTrips.length})
            </h3>
            {liveTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <FiNavigation size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p>No active trips at the moment.</p>
                <p style={{ fontSize: 13 }}>Trips with "ongoing" status will appear here in real-time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {liveTrips.map(trip => (
                  <div key={trip.tripId} className="card" style={{ padding: 20, border: '1px solid var(--border)', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                          Trip #{trip.tripId} — {trip.route?.startLocation || '?'} → {trip.route?.endLocation || '?'}
                        </h4>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          <span><FiTruck style={{ marginRight: 4 }} />{trip.vehicle?.registrationNumber || 'N/A'} ({trip.vehicle?.model || ''})</span>
                          <span><FiUsers style={{ marginRight: 4 }} />{trip.driver?.name || 'Unassigned'}</span>
                          <span><FiClock style={{ marginRight: 4 }} />Started: {trip.startTime ? new Date(trip.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</span>
                          {trip.customer && <span><FiUserCheck style={{ marginRight: 4 }} />{trip.customer.name}</span>}
                        </div>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: 13, padding: '6px 14px' }}>
                        <span className="live-dot" style={{ marginRight: 4 }} /> ONGOING
                      </span>
                    </div>
                    {trip.route?.distance && (
                      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span><FiMapPin style={{ marginRight: 4 }} />{trip.route.distance} km route</span>
                        {trip.distanceTravelled && <span style={{ marginLeft: 16 }}>{trip.distanceTravelled} km covered</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'feedback' && <FeedbackManagement />}

      {/* Notification Panel */}
      {showNotifPanel && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1999 }} onClick={() => setShowNotifPanel(false)} />
          <div className="notification-panel">
            <div className="notification-panel-header">
              <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBell /> Notifications
                {unreadCount > 0 && <span className="badge badge-danger" style={{ fontSize: 11 }}>{unreadCount} new</span>}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button className="btn btn-sm btn-secondary" onClick={markAllRead}>
                    <FiCheckCircle size={14} /> Mark all read
                  </button>
                )}
                <button className="btn btn-icon btn-secondary" onClick={() => setShowNotifPanel(false)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>
            <div className="notification-panel-body">
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <FiBell size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.notificationId} className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => {
                      setSelectedNotif(n);
                      if (!n.isRead) markOneRead(n.notificationId);
                    }} style={{ cursor: 'pointer' }}>
                    <div className={`activity-dot ${n.type || 'info'}`} style={{ marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {iconForType(n.entityType)} {n.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, borderRadius: 12, overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 18 }}>Notification Detail</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelectedNotif(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className={`notification-icon ${selectedNotif.type}`} style={{ fontSize: 24, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }}>
                  {iconForType(selectedNotif.entityType)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{selectedNotif.title}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(selectedNotif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.6 }}>
                {selectedNotif.message}
              </div>
              
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Source</label>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 13 }}>{selectedNotif.relatedType || 'System Alert'}</p>
                </div>
                <div>
                  <label style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Reference</label>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 13 }}>#{selectedNotif.relatedId || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedNotif(null)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedback(res.data);
    } catch (err) { console.error('Failed to fetch feedback', err); }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const togglePublic = async (id) => {
    try {
      await api.put(`/feedback/${id}/visibility`);
      fetchFeedback();
    } catch (err) { console.error(err); alert('Failed to update visibility'); }
  };

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/feedback/${id}/reply`, { adminReply: replyText[id] });
      setReplyText(prev => ({ ...prev, [id]: '' }));
      alert('Reply sent successfully!');
      fetchFeedback();
    } catch (err) { console.error(err); alert('Failed to send reply'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Customer Feedback & Reviews</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {feedback.length === 0 && <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No feedback records found.</p>}
        {feedback.map(fb => (
          <div key={fb.feedbackId} style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{fb.user?.name || fb.customer?.name || 'Anonymous User'}</h4>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} style={{ fill: i < fb.rating ? '#f59e0b' : 'none', color: i < fb.rating ? '#f59e0b' : '#cbd5e1', fontSize: 14 }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${fb.showPublic ? 'badge-success' : 'badge-secondary'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    {fb.showPublic ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                    {fb.showPublic ? 'Visible' : 'Hidden'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 16px' }}>"{fb.comments}"</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button className={`btn btn-sm ${fb.showPublic ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={() => togglePublic(fb.feedbackId)}
                  style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {fb.showPublic ? <><FiEyeOff /> Hide from Website</> : <><FiEye /> Show on Website</>}
                </button>
                {fb.trip && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiNavigation size={12} /> Trip #{fb.trip.tripId}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              {fb.adminReply ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--primary)' }}>
                    <FiCheckCircle size={14} />
                    <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Response</strong>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>{fb.adminReply}</p>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Reply to User</label>
                  <textarea className="form-control" rows={3} placeholder="Type your response..."
                    style={{ fontSize: 13, padding: 10, marginBottom: 12, resize: 'none' }}
                    value={replyText[fb.feedbackId] || ''}
                    onChange={e => setReplyText({ ...replyText, [fb.feedbackId]: e.target.value })} />
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                    disabled={submitting || !replyText[fb.feedbackId]}
                    onClick={() => handleReply(fb.feedbackId)}>
                    Submit Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
