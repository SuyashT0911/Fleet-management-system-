import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin, FiTruck, FiClock, FiAlertTriangle, FiDroplet, FiCoffee, FiMap, FiCalendar, FiUsers, FiEye, FiEyeOff, FiNavigation, FiActivity } from 'react-icons/fi';
import api from '../../services/api';
import './Trips.css';



const statusConfig = {
  scheduled: { label: 'Scheduled', badge: 'badge-warning', icon: <FiClock />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  accepted: { label: 'Accepted', badge: 'badge-info', icon: <FiClock />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  ongoing: { label: 'Ongoing', badge: 'badge-primary', icon: <FiTruck />, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  completed: { label: 'Completed', badge: 'badge-success', icon: <FiMapPin />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  unassigned: { label: 'Unassigned', badge: 'badge-danger', icon: <FiAlertTriangle />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const mapDbTripToView = (t) => {
  return {
    rawDbTrip: t,
    id: t.tripId || Math.random().toString().slice(-4),
    route: t.route ? `${t.route.startLocation} → ${t.route.endLocation}` : 'Unknown Route',
    driver: t.driver ? t.driver.name : 'Unknown Driver',
    vehicle: t.vehicle ? `${t.vehicle.vehicleType?.typeName || 'Vehicle'} (${t.vehicle.registrationNumber})` : 'Unassigned',
    status: t.tripStatus || 'scheduled',
    date: t.startTime ? new Date(t.startTime).toLocaleDateString() : 'N/A',
    distance: t.distanceTravelled || 0,
    expectedTime: 'TBD',
    actualTime: 'N/A',
    progress: t.tripStatus === 'completed' ? 100 : (t.tripStatus === 'ongoing' ? 50 : 0),
    currentLoc: t.route ? t.route.startLocation : 'N/A',
    customer: t.customer ? t.customer.name : 'No Customer',
    departureTime: t.startTime ? new Date(t.startTime).toLocaleTimeString() : 'N/A',
    startCoords: [20.5937, 78.9629],
    endCoords: [20.5937, 78.9629],
    currentCoords: [20.5937, 78.9629],
    timeline: []
  };
};

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [dbDrivers, setDbDrivers] = useState([]);
  const [dbVehicles, setDbVehicles] = useState([]);
  const [dbCustomers, setDbCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'routes'

  useEffect(() => {
    fetchTrips();
    fetchDriversAndVehicles();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data.map(mapDbTripToView));
    } catch (err) {
      console.error("Failed to load trips", err);
    }
  };

  const fetchDriversAndVehicles = async () => {
    try {
      const [dRes, vRes, cRes] = await Promise.all([api.get('/drivers'), api.get('/vehicles'), api.get('/users')]);
      setDbDrivers(dRes.data);
      setDbVehicles(vRes.data);
      setDbCustomers(cRes.data.filter(u => u.role?.roleName === 'ROLE_CUSTOMER'));
    } catch (err) { console.error("Failed to load drivers/vehicles", err); }
  };

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [form, setForm] = useState({ routeFrom: '', routeTo: '', driver: '', vehicle: '', date: '', departureTime: '', distance: '', customer: '', profit: '' });
  const [assignForm, setAssignForm] = useState({ driverId: '', vehicleId: '' });

  const [selectedTrip, setSelectedTrip] = useState(null);

  const filtered = trips.filter(t => {
    const matchSearch = t.route.toLowerCase().includes(search.toLowerCase()) || t.driver.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const getCount = (status) => trips.filter(t => t.status === status).length;

  const handleSchedule = async () => {
    if (!form.routeFrom || !form.routeTo || !form.driver || !form.vehicle || !form.date) {
      alert('Please fill all required fields: From, To, Driver, Vehicle, and Date.');
      return;
    }
    try {
      // Create the route first
      const routeRes = await api.post('/routes', {
        routeName: `${form.routeFrom} → ${form.routeTo}`,
        startLocation: form.routeFrom,
        endLocation: form.routeTo,
        distance: parseFloat(form.distance) || 0
      });
      const tripPayload = {
        vehicle: { vehicleId: parseInt(form.vehicle) },
        driver: { driverId: parseInt(form.driver) },
        route: { routeId: routeRes.data.routeId },
        startTime: `${form.date}T${form.departureTime || '00:00'}:00`,
        distanceTravelled: 0,
        profit: parseFloat(form.profit) || 0,
        tripStatus: 'scheduled'
      };
      await api.post('/trips', tripPayload);
      fetchTrips();
      setShowScheduleModal(false);
      setForm({ routeFrom: '', routeTo: '', driver: '', vehicle: '', date: '', departureTime: '', distance: '', customer: '', profit: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to create trip. " + (err.response?.data?.message || 'Check console.'));
    }
  };

  const handleAssign = async () => {
    if (!assignForm.driverId || !assignForm.vehicleId) {
      alert("Please select both a driver and a vehicle.");
      return;
    }
    try {
      const payload = { 
        ...selectedTrip.rawDbTrip, 
        driver: { driverId: parseInt(assignForm.driverId) }, 
        vehicle: { vehicleId: parseInt(assignForm.vehicleId) } 
      };
      await api.put(`/trips/${selectedTrip.id}`, payload);
      fetchTrips();
      setSelectedTrip(null);
      setAssignForm({ driverId: '', vehicleId: '' });
      alert("Trip successfully assigned.");
    } catch (err) {
      console.error(err);
      alert("Failed to assign trip.");
    }
  };

  const handleTripSelect = async (t) => {
    setSelectedTrip(t);
    if (t.rawDbTrip && t.rawDbTrip.tripId) {
      try {
        const [incRes, fuelRes] = await Promise.all([
          api.get(`/incidents/trip/${t.rawDbTrip.tripId}`).catch(() => ({ data: [] })),
          api.get(`/fuel/trip/${t.rawDbTrip.tripId}`).catch(() => ({ data: [] }))
        ]);
        
        let newTimeline = [
          { type: 'start', time: t.departureTime, desc: `Departed from ${t.rawDbTrip.route?.startLocation || 'origin'}` }
        ];

        incRes.data.forEach(inc => {
          newTimeline.push({
            type: 'incident',
            time: inc.date ? new Date(inc.date).toLocaleDateString() : 'Unknown Date',
            desc: `Incident: ${inc.type} - ${inc.description}`
          });
        });

        fuelRes.data.forEach(fuel => {
          newTimeline.push({
            type: 'fuel',
            time: fuel.date ? new Date(fuel.date).toLocaleDateString() : 'Unknown Date',
            desc: `Fuel Log: ₹${fuel.cost} for ${fuel.quantity}L (Mileage: ${fuel.mileage || 'N/A'} km/l)`
          });
        });

        if (t.status === 'completed') {
           newTimeline.push({ type: 'end', time: 'Completed', desc: `Arrived at ${t.rawDbTrip.route?.endLocation || 'destination'}` });
        }

        setSelectedTrip(prev => prev && prev.id === t.id ? { ...prev, timeline: newTimeline } : prev);
      } catch (err) {
        console.error("Failed to load extra trip details", err);
      }
    }
  };

  const timelineIcon = (type) => {
    switch (type) {
      case 'start': return <FiMapPin style={{ color: '#10b981' }} />;
      case 'end': return <FiMapPin style={{ color: '#6366f1' }} />;
      case 'fuel': return <FiDroplet style={{ color: '#06b6d4' }} />;
      case 'stop': return <FiCoffee style={{ color: '#f59e0b' }} />;
      case 'incident': return <FiAlertTriangle style={{ color: '#ef4444' }} />;
      default: return <FiClock />;
    }
  };

  return (
    <div className="page-content" style={{ position: 'relative' }}>
      <div className="page-header">
        <div>
          <h1>{activeTab === 'trips' ? 'Trip Management' : 'Route Management'}</h1>
          <p>{activeTab === 'trips' ? "Monitor your fleet's schedules, live GPS routes, and completed journeys" : "Control which routes appear on the public website"}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="tab-group">
            <button className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')}>
              <FiNavigation /> Trips
            </button>
            <button className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>
              <FiMapPin /> Route Visibility
            </button>
          </div>
          {activeTab === 'trips' && (
            <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}>
              <FiPlus /> Schedule Trip
            </button>
          )}
        </div>
      </div>

      {activeTab === 'trips' ? (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setFilter('ALL')}>
              <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiMap /></div>
              <div className="kpi-info"><h3>All Trips</h3><div className="kpi-value">{trips.length}</div></div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ongoing' ? '#06b6d4' : undefined }} onClick={() => setFilter('ongoing')}>
              <div className="kpi-icon" style={{ background: statusConfig.ongoing.bg, color: statusConfig.ongoing.color }}><span className="live-dot" style={{ position: 'absolute', top: 12, right: 12 }} />{statusConfig.ongoing.icon}</div>
              <div className="kpi-info"><h3>Ongoing</h3><div className="kpi-value" style={{ color: statusConfig.ongoing.color }}>{getCount('ongoing')}</div></div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'scheduled' ? '#f59e0b' : undefined }} onClick={() => setFilter('scheduled')}>
              <div className="kpi-icon" style={{ background: statusConfig.scheduled.bg, color: statusConfig.scheduled.color }}>{statusConfig.scheduled.icon}</div>
              <div className="kpi-info"><h3>Scheduled</h3><div className="kpi-value" style={{ color: statusConfig.scheduled.color }}>{getCount('scheduled')}</div></div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'completed' ? '#10b981' : undefined }} onClick={() => setFilter('completed')}>
              <div className="kpi-icon" style={{ background: statusConfig.completed.bg, color: statusConfig.completed.color }}>{statusConfig.completed.icon}</div>
              <div className="kpi-info"><h3>Completed</h3><div className="kpi-value" style={{ color: statusConfig.completed.color }}>{getCount('completed')}</div></div>
            </div>
          </div>

          <div className="data-table-wrapper">
            <div className="data-table-header">
              <h2>Trips List ({filtered.length})</h2>
              <div className="search-bar">
                <FiSearch className="search-icon" />
                <input type="text" className="form-control" placeholder="Search route or driver..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
              </div>
            </div>
            <table className="data-table trips-table">
              <thead><tr><th>ID</th><th>Route</th><th>Driver & Vehicle</th><th>Date</th><th>Distance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => handleTripSelect(t)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>#{t.id}</td>
                    <td style={{ fontWeight: 600 }}>{t.route}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.driver}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.vehicle}</div>
                    </td>
                    <td>{t.date}</td>
                    <td>{t.distance} km</td>
                    <td><span className={`badge ${statusConfig[t.status].badge}`}>{statusConfig[t.status].label}</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleTripSelect(t); }}>View Large</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No trips found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <RouteVisibilitySection />
      )}

      {/* Schedule Trip Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 600 }}>
            <div className="modal-header"><h2>Schedule New Trip</h2><button className="btn btn-icon btn-secondary" onClick={() => setShowScheduleModal(false)}>✕</button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>From (Source)</label><input className="form-control" placeholder="e.g. Pune" value={form.routeFrom} onChange={(e) => setForm({ ...form, routeFrom: e.target.value })} /></div>
                <div className="form-group"><label>To (Destination)</label><input className="form-control" placeholder="e.g. Mumbai" value={form.routeTo} onChange={(e) => setForm({ ...form, routeTo: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Assign Customer</label>
                <select className="form-control" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                  <option value="">Select Customer (Optional)</option>
                  {dbCustomers.map(c => <option key={c.userId} value={c.userId}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Assign Driver *</label>
                  <select className="form-control" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} required>
                    <option value="">Select Driver</option>
                    {dbDrivers.map(d => <option key={d.driverId} value={d.driverId}>{d.name} ({d.status})</option>)}
                  </select>
                  {dbDrivers.length === 0 && <small style={{color:'var(--text-muted)'}}>No drivers in DB. Add drivers first.</small>}
                </div>
                <div className="form-group"><label>Assign Vehicle *</label>
                  <select className="form-control" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required>
                    <option value="">Select Vehicle</option>
                    {dbVehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleType?.typeName || 'Vehicle'} - {v.registrationNumber}</option>)}
                  </select>
                  {dbVehicles.length === 0 && <small style={{color:'var(--text-muted)'}}>No vehicles in DB. Add vehicles first.</small>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Date</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="form-group"><label>Time</label><input type="time" className="form-control" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} /></div>
                <div className="form-group"><label>Distance (km)</label><input type="number" className="form-control" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSchedule}>Schedule Trip</button></div>
          </div>
        </div>
      )}

      {/* Modern Fullscreen/Large Detailed Pane */}
      {selectedTrip && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', zIndex: 1100 }} onClick={() => setSelectedTrip(null)}>
          <div className="modal trip-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header trip-detail-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="trip-detail-icon"><FiMap /></div>
                <div>
                  <h2 style={{ fontSize: 28, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {selectedTrip.route}
                    <span className={`badge ${statusConfig[selectedTrip.status].badge}`} style={{ fontSize: 13, border: 'none' }}>
                      {selectedTrip.status === 'ongoing' && <span className="live-dot" style={{ display: 'inline-block', marginRight: 6 }} />}
                      {statusConfig[selectedTrip.status].label}
                    </span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>Trip #{selectedTrip.id} • Customer: {selectedTrip.customer}</p>
                </div>
              </div>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelectedTrip(null)}>✕</button>
            </div>

            <div className="trip-detail-body">
              {/* Left Column: Stats & Timeline */}
              <div className="trip-detail-left">
                {/* Driver Card */}
                {!selectedTrip.rawDbTrip.driver || !selectedTrip.rawDbTrip.vehicle ? (
                  <div className="detail-card driver-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FiAlertTriangle color="#f59e0b" /> Trip Unassigned</h3>
                      <button className="btn btn-primary btn-sm" onClick={handleAssign}>Assign</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <select className="form-control" value={assignForm.driverId} onChange={e => setAssignForm({ ...assignForm, driverId: e.target.value })}>
                        <option value="">Select Driver</option>
                        {dbDrivers.map(d => <option key={d.driverId} value={d.driverId}>{d.name}</option>)}
                      </select>
                      <select className="form-control" value={assignForm.vehicleId} onChange={e => setAssignForm({ ...assignForm, vehicleId: e.target.value })}>
                        <option value="">Select Vehicle</option>
                        {dbVehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleType?.typeName || 'Vehicle'} - {v.registrationNumber}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="detail-card driver-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{selectedTrip.driver.charAt(0)}</div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16 }}>{selectedTrip.driver}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Contact: +91 9876543210</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}><FiTruck style={{ marginRight: 6 }} />{selectedTrip.vehicle}</p>
                      <span className="badge badge-success" style={{ marginTop: 4 }}>Vehicle Healthy</span>
                    </div>
                  </div>
                )}

                {/* Timing Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div className="detail-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 8 }}><FiClock /> Expected Time</div>
                    <p style={{ fontSize: 24, fontWeight: 800 }}>{selectedTrip.expectedTime}</p>
                  </div>
                  <div className="detail-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 8 }}><FiClock /> Elapsed Time</div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: selectedTrip.status === 'ongoing' ? '#06b6d4' : 'inherit' }}>{selectedTrip.actualTime}</p>
                  </div>
                  <div className="detail-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 8 }}><FiCalendar /> Departure</div>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{selectedTrip.date} <br/> {selectedTrip.departureTime}</p>
                  </div>
                  <div className="detail-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 8 }}><FiMapPin /> Total Distance</div>
                    <p style={{ fontSize: 24, fontWeight: 800 }}>{selectedTrip.distance} km</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="detail-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Activity Log</h3>
                  <div style={{ overflowY: 'auto', flex: 1, paddingRight: 10 }}>
                    {selectedTrip.timeline.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Trip has not started yet.</div>
                    ) : (
                      <div className="timeline">
                        {selectedTrip.timeline.map((event, idx) => (
                          <div key={idx} className="timeline-item">
                            <div className={`timeline-icon ${event.type}`}>{timelineIcon(event.type)}</div>
                            <div className="timeline-content">
                              <span className="timeline-time">{event.time}</span>
                              <p className="timeline-desc">{event.desc}</p>
                            </div>
                          </div>
                        ))}
                        {selectedTrip.status === 'ongoing' && (
                          <div className="timeline-item">
                            <div className="timeline-icon pulse"><span className="live-dot" style={{ margin: 0 }} /></div>
                            <div className="timeline-content">
                              <span className="timeline-time">Live Status</span>
                              <p className="timeline-desc" style={{ color: '#06b6d4' }}>Vehicle is en route near {selectedTrip.currentLoc}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Live GPS Map */}
              <div className="trip-detail-right">
                <div className="map-wrapper">
                  {selectedTrip.status === 'ongoing' && (
                    <div className="map-overlay-status">
                      <span className="live-dot" style={{ marginRight: 8 }} /> LIVE GPS TRACKING ACTIVE
                    </div>
                  )}
                  <iframe 
                    title="live-map"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${selectedTrip.currentCoords[0]},${selectedTrip.currentCoords[1]}&z=9&output=embed`}
                  ></iframe>
                </div>
                
                {selectedTrip.status === 'ongoing' && (
                  <div className="route-progress-bar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                      <span style={{ color: '#06b6d4' }}>{selectedTrip.progress}% Completed</span>
                      <span style={{ color: '#f59e0b' }}>{Math.floor(selectedTrip.distance * (1 - selectedTrip.progress/100))} km Remaining</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${selectedTrip.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', transition: 'width 1s' }} />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RouteVisibilitySection = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes/all');
      setRoutes(res.data);
    } catch (err) { console.error('Failed to fetch routes', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const toggleVisibility = async (id) => {
    try {
      await api.put(`/routes/${id}/visibility`);
      fetchRoutes();
    } catch (err) { console.error(err); alert('Failed to update route visibility'); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading routes...</div>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Route Visibility Management</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Control which routes appear on the public "Available Routes" page</p>
        </div>
      </div>
      <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Route Name</th>
              <th>Locations</th>
              <th>Distance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No routes found.</td>
              </tr>
            )}
            {routes.map(r => (
              <tr key={r.routeId}>
                <td style={{ fontWeight: 600 }}>#{r.routeId}</td>
                <td style={{ fontWeight: 600 }}>{r.routeName}</td>
                <td>
                  <div style={{ fontSize: 13 }}>{r.startLocation} → {r.endLocation}</div>
                </td>
                <td>{r.distance} km</td>
                <td>
                  <span className={`badge ${r.publicRoute ? 'badge-success' : 'badge-secondary'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                    {r.publicRoute ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                    {r.publicRoute ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button className={`btn btn-sm ${r.publicRoute ? 'btn-secondary' : 'btn-primary'}`} 
                    onClick={() => toggleVisibility(r.routeId)}
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.publicRoute ? <><FiEyeOff /> Hide</> : <><FiEye /> Show</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Trips;
