import React, { useState, useEffect, useCallback } from 'react';
import { FiNavigation, FiTruck, FiClock, FiMapPin, FiAlertCircle, FiDroplet, FiCheckCircle, FiPlay, FiPause, FiFlag, FiStar, FiBell, FiX, FiCheckCircle as FiCheckCircleSolid, FiActivity } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverInfo, setDriverInfo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tab, setTab] = useState('assigned');
  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ type: 'Breakdown', description: '' });
  const [fuelForm, setFuelForm] = useState({ quantity: '', cost: '', mileage: '' });

  // Find driver record by user email
  const fetchDriverData = useCallback(async () => {
    try {
      const driversRes = await api.get('/drivers');
      const userRes = await api.get(`/users/email/${user.email}`);
      const userData = userRes.data;
      const myDriver = driversRes.data.find(d => d.user?.userId === userData.userId);
      if (myDriver) {
        setDriverInfo(myDriver);
        const tripsRes = await api.get(`/trips/driver/${myDriver.driverId}`);
        setTrips(tripsRes.data);
        
      }
    } catch (err) { console.error('Driver data fetch error', err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { 
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 30000);
    return () => clearInterval(interval);
  }, [fetchDriverData]);

  const updateTripStatus = async (tripId, newStatus) => {
    try {
      const trip = trips.find(t => t.tripId === tripId);
      const payload = { ...trip, tripStatus: newStatus };
      if (newStatus === 'completed') payload.endTime = new Date().toISOString();
      await api.put(`/trips/${tripId}`, payload);
      fetchDriverData();
      if (selectedTrip?.tripId === tripId) {
        setSelectedTrip(prev => ({ ...prev, tripStatus: newStatus }));
      }
    } catch (err) { console.error('Status update error', err); alert('Failed to update trip status'); }
  };

  const submitIncident = async () => {
    if (!incidentForm.description.trim()) { alert('Please enter incident description'); return; }
    try {
      await api.post('/incidents', {
        trip: { tripId: selectedTrip.tripId },
        vehicle: selectedTrip.vehicle ? { vehicleId: selectedTrip.vehicle.vehicleId } : null,
        driver: { driverId: driverInfo.driverId },
        type: incidentForm.type,
        description: incidentForm.description,
        date: new Date().toISOString().split('T')[0],
        status: 'reported'
      });
      setShowIncidentModal(false);
      setIncidentForm({ type: 'Breakdown', description: '' });
      alert('Incident reported successfully!');
    } catch (err) { console.error(err); alert('Failed to report incident'); }
  };

  const submitFuelLog = async () => {
    if (!fuelForm.quantity || !fuelForm.cost) { alert('Quantity and cost are required'); return; }
    try {
      await api.post('/fuel', {
        trip: selectedTrip ? { tripId: selectedTrip.tripId } : null,
        vehicle: selectedTrip?.vehicle ? { vehicleId: selectedTrip.vehicle.vehicleId } : null,
        driver: { driverId: driverInfo.driverId },
        quantity: parseFloat(fuelForm.quantity),
        cost: parseFloat(fuelForm.cost),
        mileage: fuelForm.mileage ? parseFloat(fuelForm.mileage) : null,
        date: new Date().toISOString().split('T')[0]
      });
      setShowFuelModal(false);
      setFuelForm({ quantity: '', cost: '', mileage: '' });
      alert('Fuel log submitted successfully!');
    } catch (err) { console.error(err); alert('Failed to log fuel'); }
  };

  const assignedTrips = trips.filter(t => t.tripStatus === 'scheduled');
  const acceptedTrips = trips.filter(t => t.tripStatus === 'accepted');
  const ongoingTrips = trips.filter(t => t.tripStatus === 'ongoing');
  const completedTrips = trips.filter(t => t.tripStatus === 'completed');
  const currentTrips = tab === 'assigned' ? assignedTrips : tab === 'accepted' ? acceptedTrips : tab === 'ongoing' ? ongoingTrips : completedTrips;

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading driver dashboard...</p>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Driver Dashboard</h1>
          <p>Welcome back, {driverInfo?.name || user?.name || 'Driver'}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FiClock /></div>
          <div className="kpi-info"><h3>Assigned</h3><div className="kpi-value">{assignedTrips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}><FiNavigation /></div>
          <div className="kpi-info"><h3>Ongoing</h3><div className="kpi-value">{ongoingTrips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiCheckCircle /></div>
          <div className="kpi-info"><h3>Completed</h3><div className="kpi-value">{completedTrips.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiStar /></div>
          <div className="kpi-info"><h3>Total Trips</h3><div className="kpi-value">{trips.length}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 24 }}>
        <div className="tab-group">
          <button className={`tab-btn ${tab === 'assigned' ? 'active' : ''}`} onClick={() => { setTab('assigned'); setSelectedTrip(null); }}>
            <FiClock /> Assigned ({assignedTrips.length})
          </button>
          <button className={`tab-btn ${tab === 'ongoing' ? 'active' : ''}`} onClick={() => { setTab('ongoing'); setSelectedTrip(null); }}>
            <FiNavigation /> Ongoing ({ongoingTrips.length})
          </button>
          <button className={`tab-btn ${tab === 'completed' ? 'active' : ''}`} onClick={() => { setTab('completed'); setSelectedTrip(null); }}>
            <FiFlag /> Completed ({completedTrips.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTrip ? '1fr 420px' : '1fr', gap: 24 }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentTrips.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <FiNavigation size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No {tab} trips.</p>
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
                  {trip.tripStatus}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span><FiTruck style={{ marginRight: 4 }} />{trip.vehicle?.registrationNumber || 'N/A'}</span>
                <span><FiMapPin style={{ marginRight: 4 }} />{trip.route?.distance || '?'} km</span>
                <span><FiClock style={{ marginRight: 4 }} />{trip.startTime ? new Date(trip.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</span>
                {trip.customer && <span>Customer: {trip.customer.name}</span>}
              </div>
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
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
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
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Start Time</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.startTime ? new Date(selectedTrip.startTime).toLocaleString('en-IN') : 'N/A'}</div>
              </div>
            </div>

            {selectedTrip.customer && (
              <div className="detail-card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Customer</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedTrip.customer.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedTrip.customer.contact}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {selectedTrip.tripStatus === 'accepted' && (
                <button className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}
                  onClick={() => updateTripStatus(selectedTrip.tripId, 'ongoing')}>
                  <FiPlay /> Start Trip
                </button>
              )}
              {selectedTrip.tripStatus === 'ongoing' && (
                <>
                  <button className="btn btn-primary" style={{ justifyContent: 'center', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    onClick={() => updateTripStatus(selectedTrip.tripId, 'completed')}>
                    <FiFlag /> Complete Trip
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button className="btn btn-danger" onClick={() => setShowIncidentModal(true)}>
                      <FiAlertCircle /> Report Incident
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowFuelModal(true)}>
                      <FiDroplet /> Log Fuel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="modal-overlay" onClick={() => setShowIncidentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiAlertCircle style={{ marginRight: 8, color: '#ef4444' }} /> Report Incident</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowIncidentModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Incident Type *</label>
                <select className="form-control" value={incidentForm.type} onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value })}>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Accident">Accident</option>
                  <option value="Flat Tire">Flat Tire</option>
                  <option value="Engine Issue">Engine Issue</option>
                  <option value="Road Block">Road Block</option>
                  <option value="Weather">Weather Delay</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea className="form-control" rows={4} value={incidentForm.description}
                  onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Describe the incident in detail..." style={{ resize: 'vertical' }} />
              </div>
              <div className="detail-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>For Trip: #{selectedTrip?.tripId} • Vehicle: {selectedTrip?.vehicle?.registrationNumber || 'N/A'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowIncidentModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={submitIncident}><FiAlertCircle /> Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiDroplet style={{ marginRight: 8, color: '#06b6d4' }} /> Log Fuel Entry</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowFuelModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Quantity (Liters) *</label>
                  <input type="number" className="form-control" value={fuelForm.quantity}
                    onChange={e => setFuelForm({ ...fuelForm, quantity: e.target.value })} placeholder="e.g. 45" />
                </div>
                <div className="form-group">
                  <label>Cost (₹) *</label>
                  <input type="number" className="form-control" value={fuelForm.cost}
                    onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} placeholder="e.g. 4500" />
                </div>
              </div>
              <div className="form-group">
                <label>Current Mileage (km)</label>
                <input type="number" className="form-control" value={fuelForm.mileage}
                  onChange={e => setFuelForm({ ...fuelForm, mileage: e.target.value })} placeholder="e.g. 12500" />
              </div>
              <div className="detail-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>For Trip: #{selectedTrip?.tripId} • Vehicle: {selectedTrip?.vehicle?.registrationNumber || 'N/A'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitFuelLog}><FiDroplet /> Save Fuel Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
