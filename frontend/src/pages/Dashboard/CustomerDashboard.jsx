import React, { useState, useEffect, useCallback } from 'react';
import { FiNavigation, FiMapPin, FiClock, FiTruck, FiCheckCircle, FiStar, FiCalendar, FiDollarSign, FiMessageSquare, FiUsers, FiBell, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '' });
  const [feedbackList, setFeedbackList] = useState([]);

  const fetchCustomerData = useCallback(async () => {
    try {
      const userRes = await api.get(`/users/email/${user.email}`);
      const userData = userRes.data;
      const customersRes = await api.get('/trips');
      // Find customer record
      const allTrips = customersRes.data;
      // Get customer by checking which trips have this user's customer
      const feedbackRes = await api.get('/feedback');
      setFeedbackList(feedbackRes.data);

      // Try to get customer info from all customers endpoint indirectly
      // We use the trips that have a customer matching our userId
      const myTrips = allTrips.filter(t => t.customer?.user?.userId === userData.userId);
      if (myTrips.length > 0 && myTrips[0].customer) {
        setCustomerInfo(myTrips[0].customer);
      } else {
        // Fallback: try getting customer ID from database
        setCustomerInfo({ name: user.name, email: user.email, customerId: null });
      }
      setTrips(myTrips);
    } catch (err) { console.error('Customer data fetch error', err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { 
    fetchCustomerData();
    const interval = setInterval(fetchCustomerData, 30000);
    return () => clearInterval(interval);
  }, [fetchCustomerData]);

  const submitFeedback = async () => {
    if (!feedbackForm.comments.trim()) { alert('Please enter your feedback'); return; }
    try {
      const userRes = await api.get(`/users/email/${user.email}`);
      await api.post('/feedback', {
        trip: selectedTrip ? { tripId: selectedTrip.tripId } : null,
        customer: customerInfo?.customerId ? { customerId: customerInfo.customerId } : null,
        user: { userId: userRes.data.userId },
        rating: feedbackForm.rating,
        comments: feedbackForm.comments,
      });
      setShowFeedbackModal(false);
      setFeedbackForm({ rating: 5, comments: '' });
      alert('Thank you for your feedback!');
      fetchCustomerData();
    } catch (err) { console.error(err); alert('Failed to submit feedback'); }
  };

  const activeTrips = trips.filter(t => t.tripStatus === 'ongoing' || t.tripStatus === 'scheduled');
  const completedTrips = trips.filter(t => t.tripStatus === 'completed');
  const currentTrips = tab === 'active' ? activeTrips : completedTrips;
  const myFeedback = feedbackList.filter(f => f.customer?.customerId === customerInfo?.customerId);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome back, {customerInfo?.name || user?.name || 'Customer'}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}><FiNavigation /></div>
          <div className="kpi-info"><h3>Active Trips</h3><div className="kpi-value">{activeTrips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiCheckCircle /></div>
          <div className="kpi-info"><h3>Completed</h3><div className="kpi-value">{completedTrips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiCalendar /></div>
          <div className="kpi-info"><h3>Total Trips</h3><div className="kpi-value">{trips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FiStar /></div>
          <div className="kpi-info"><h3>Reviews Given</h3><div className="kpi-value">{myFeedback.length}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 24 }}>
        <div className="tab-group">
          <button className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => { setTab('active'); setSelectedTrip(null); }}>
            <FiNavigation /> Active ({activeTrips.length})
          </button>
          <button className={`tab-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => { setTab('completed'); setSelectedTrip(null); }}>
            <FiCheckCircle /> History ({completedTrips.length})
          </button>
          <button className={`tab-btn ${tab === 'feedback' ? 'active' : ''}`} onClick={() => { setTab('feedback'); setSelectedTrip(null); }}>
            <FiStar /> My Reviews ({myFeedback.length})
          </button>
        </div>
      </div>

      {tab !== 'feedback' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedTrip ? '1fr 400px' : '1fr', gap: 24 }}>
          {/* Trip List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentTrips.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <FiNavigation size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p>No {tab === 'active' ? 'active' : 'completed'} trips.</p>
                {tab === 'active' && <p style={{ fontSize: 13, marginTop: 8 }}>Book a trip to get started!</p>}
              </div>
            )}
            {currentTrips.map(trip => (
              <div key={trip.tripId} className="card" style={{ padding: 20, cursor: 'pointer', borderColor: selectedTrip?.tripId === trip.tripId ? 'var(--primary)' : undefined }}
                onClick={() => setSelectedTrip(trip)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                    {trip.route?.startLocation || '?'} → {trip.route?.endLocation || '?'}
                  </h3>
                  <span className={`badge ${trip.tripStatus === 'completed' ? 'badge-success' : trip.tripStatus === 'ongoing' ? 'badge-info' : 'badge-warning'}`}>
                    {trip.tripStatus === 'ongoing' ? '🟢 Ongoing' : trip.tripStatus === 'completed' ? '✓ Completed' : '⏳ Scheduled'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span><FiTruck style={{ marginRight: 4 }} />{trip.vehicle?.model || 'N/A'}</span>
                  <span><FiMapPin style={{ marginRight: 4 }} />{trip.route?.distance || '?'} km</span>
                  <span><FiClock style={{ marginRight: 4 }} />{trip.startTime ? new Date(trip.startTime).toLocaleDateString('en-IN') : 'N/A'}</span>
                  {trip.driver && <span><FiUsers style={{ marginRight: 4 }} />{trip.driver.name}</span>}
                </div>
                {trip.profit && (
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                    <FiDollarSign style={{ marginRight: 4 }} />₹{parseFloat(trip.profit).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trip Detail Panel */}
          {selectedTrip && (
            <div className="card" style={{ position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Trip #{selectedTrip.tripId}</h3>
                <span className={`badge ${selectedTrip.tripStatus === 'completed' ? 'badge-success' : selectedTrip.tripStatus === 'ongoing' ? 'badge-info' : 'badge-warning'}`}>
                  {selectedTrip.tripStatus}
                </span>
              </div>

              <div className="detail-card" style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {selectedTrip.route?.startLocation || '?'} → {selectedTrip.route?.endLocation || '?'}
                </h4>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                  <span><FiMapPin style={{ marginRight: 4 }} />{selectedTrip.route?.distance || '?'} km</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="detail-card">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Vehicle</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.vehicle?.registrationNumber || 'N/A'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedTrip.vehicle?.model || ''}</div>
                </div>
                <div className="detail-card">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Driver</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.driver?.name || 'Not Assigned'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedTrip.driver?.contactNumber || ''}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="detail-card">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Start</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.startTime ? new Date(selectedTrip.startTime).toLocaleString('en-IN') : 'N/A'}</div>
                </div>
                <div className="detail-card">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>End</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.endTime ? new Date(selectedTrip.endTime).toLocaleString('en-IN') : 'In Progress'}</div>
                </div>
              </div>

              {selectedTrip.tripStatus === 'completed' && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowFeedbackModal(true)}>
                  <FiStar /> Leave Feedback
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {tab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myFeedback.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <FiMessageSquare size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No reviews yet. Complete a trip and share your experience!</p>
            </div>
          ) : (
            myFeedback.map(fb => (
              <div key={fb.feedbackId} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <FiStar key={s} style={{ fill: s <= fb.rating ? '#f59e0b' : 'none', color: s <= fb.rating ? '#f59e0b' : '#cbd5e1', fontSize: 16 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
                <p style={{ fontSize: 14, marginBottom: 4 }}>{fb.comments}</p>
                {fb.trip && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Trip #{fb.trip.tripId}</div>}
                {fb.adminReply && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(99,102,241,0.06)', borderRadius: 10, borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Admin Reply</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fb.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiStar style={{ marginRight: 8, color: '#f59e0b' }} /> Rate Your Trip</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowFeedbackModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>How was your experience?</p>
                <div className="star-rating" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setFeedbackForm({ ...feedbackForm, rating: s })}>
                      <FiStar style={{ fill: s <= feedbackForm.rating ? '#f59e0b' : 'none', color: s <= feedbackForm.rating ? '#f59e0b' : '#cbd5e1' }} />
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                  {feedbackForm.rating === 5 ? '⭐ Excellent!' : feedbackForm.rating === 4 ? '👍 Good' : feedbackForm.rating === 3 ? '😐 Average' : feedbackForm.rating === 2 ? '👎 Below Average' : '😞 Poor'}
                </p>
              </div>
              <div className="form-group">
                <label>Your Feedback *</label>
                <textarea className="form-control" rows={4} value={feedbackForm.comments}
                  onChange={e => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Tell us about your experience..." style={{ resize: 'vertical' }} />
              </div>
              {selectedTrip && (
                <div className="detail-card">
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trip: {selectedTrip.route?.startLocation} → {selectedTrip.route?.endLocation}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitFeedback}><FiStar /> Submit Feedback</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;
