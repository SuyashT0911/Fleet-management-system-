import React, { useState, useEffect, useCallback } from 'react';
import { FiMap, FiClock, FiTruck, FiMapPin, FiCalendar, FiNavigation, FiCheckCircle, FiAlertCircle, FiDroplet, FiFlag } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverMyTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [driverInfo, setDriverInfo] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [incidentForm, setIncidentForm] = useState({ type: 'Breakdown', description: '' });
  const [fuelForm, setFuelForm] = useState({ quantity: '', cost: '', mileage: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [qrScanned, setQrScanned] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const userRes = await api.get(`/users/email/${user.email}`);
      const driversRes = await api.get('/drivers');
      const myDriver = driversRes.data.find(d => d.user?.userId === userRes.data.userId);
      if (myDriver) {
        setDriverInfo(myDriver);
        const tripsRes = await api.get(`/trips/driver/${myDriver.driverId}`);
        setTrips(tripsRes.data);
      }
    } catch (err) { console.error('Failed to fetch trips', err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const updateTripStatus = async (tripId, status) => {
    try {
      const tripToUpdate = trips.find(t => t.tripId === tripId);
      const payload = { ...tripToUpdate, tripStatus: status };
      if (status === 'completed') {
        payload.endTime = new Date().toISOString();
        payload.profit = tripToUpdate.route?.distance ? (tripToUpdate.route.distance * 15).toFixed(2) : 0;
      }
      await api.put(`/trips/${tripId}`, payload);
      fetchTrips();
    } catch (err) {
      console.error('Failed to update trip status', err);
      alert('Failed to update trip status.');
    }
  };

  const handleInitiateCompletion = (trip) => {
    setSelectedTrip(trip);
    const amt = trip.route?.distance ? (trip.route.distance * 15).toFixed(2) : 0;
    setPaymentAmount(amt);
    setPaymentMethod('Cash');
    setQrScanned(false);
    setShowPaymentModal(true);
  };

  const completeTripWithPayment = async () => {
    try {
      await api.post('/payments', {
        trip: { tripId: selectedTrip.tripId },
        amount: parseFloat(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        method: paymentMethod,
        status: 'completed'
      });
      await updateTripStatus(selectedTrip.tripId, 'completed');
      setShowPaymentModal(false);
      alert('Payment collected and trip completed!');
    } catch (err) {
      console.error(err);
      alert('Failed to complete payment.');
    }
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

  const myAcceptedTrips = trips.filter(t => t.tripStatus !== 'scheduled');
  const filtered = filter === 'all' ? myAcceptedTrips : myAcceptedTrips.filter(t => t.tripStatus === filter);

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>My Trips</h1><p>View all your current and past trips</p></div>
        <div className="tab-group">
          {['all', 'accepted', 'ongoing', 'completed'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? myAcceptedTrips.length : myAcceptedTrips.filter(t => t.tripStatus === f).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <FiMap style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
          <h3>No trips found</h3>
          <p>You don't have any trips matching this status.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(trip => (
            <div key={trip.tripId} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Trip #{trip.tripId}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{trip.route?.startLocation || '?'} → {trip.route?.endLocation || '?'}</h3>
                </div>
                <span className={`badge badge-${trip.tripStatus === 'ongoing' ? 'info' : trip.tripStatus === 'completed' ? 'success' : 'primary'}`}>
                  {trip.tripStatus.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <FiMapPin style={{ color: '#6366f1' }} /> Distance: {trip.route?.distance || 0} km
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <FiClock style={{ color: '#06b6d4' }} /> {trip.startTime ? new Date(trip.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <FiTruck style={{ color: '#10b981' }} /> {trip.vehicle?.model || 'N/A'}
                </div>
              </div>

              {trip.tripStatus === 'completed' && trip.endTime && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <FiCheckCircle style={{ marginRight: 4, color: '#10b981' }} />
                  Completed: {new Date(trip.endTime).toLocaleString('en-IN')}
                  {trip.profit && <span style={{ marginLeft: 16, color: '#10b981', fontWeight: 600 }}>Revenue: ₹{parseFloat(trip.profit).toLocaleString()}</span>}
                </div>
              )}
              {/* Trip Actions */}
              {(trip.tripStatus === 'accepted' || trip.tripStatus === 'ongoing') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                  {trip.tripStatus === 'accepted' && (
                    <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => updateTripStatus(trip.tripId, 'ongoing')}>
                      <FiNavigation /> Start Trip
                    </button>
                  )}
                  {trip.tripStatus === 'ongoing' && (
                    <>
                      <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '100%', justifyContent: 'center' }} onClick={() => handleInitiateCompletion(trip)}>
                        <FiFlag /> Complete Trip
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button className="btn btn-danger btn-sm" onClick={() => { setSelectedTrip(trip); setShowIncidentModal(true); }}>
                          <FiAlertCircle /> Incident
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedTrip(trip); setShowFuelModal(true); }}>
                          <FiDroplet /> Fuel Log
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
                <textarea className="form-control" rows="4" placeholder="Describe the incident details, exact location, and current status..." value={incidentForm.description} onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}></textarea>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={submitIncident}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
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
                  <input type="number" step="0.1" className="form-control" placeholder="e.g. 45.5" value={fuelForm.quantity} onChange={e => setFuelForm({ ...fuelForm, quantity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Total Cost (₹) *</label>
                  <input type="number" className="form-control" placeholder="e.g. 4500" value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Current Mileage/Odometer (Optional)</label>
                <input type="number" className="form-control" placeholder="e.g. 125400" value={fuelForm.mileage} onChange={e => setFuelForm({ ...fuelForm, mileage: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={submitFuelLog}>Save Fuel Log</button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Collection Modal */}
      {showPaymentModal && selectedTrip && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Collect Payment</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Amount to Collect</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>₹{paymentAmount}</div>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button className={`btn ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setPaymentMethod('Cash'); setQrScanned(false); }}>Cash</button>
                  <button className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPaymentMethod('UPI')}>UPI / QR</button>
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, marginBottom: 20 }}>
                  {!qrScanned ? (
                    <>
                      <div style={{ width: 150, height: 150, background: '#fff', margin: '0 auto 16px', padding: 10, borderRadius: 8 }}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay_trip_${selectedTrip.tripId}_amt_${paymentAmount}`} alt="QR Code" style={{ width: '100%' }} />
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Ask customer to scan QR to pay.</p>
                      <button className="btn btn-secondary btn-sm" onClick={() => setQrScanned(true)}>Simulate Customer Scan</button>
                    </>
                  ) : (
                    <div style={{ color: '#10b981' }}>
                      <FiCheckCircle style={{ fontSize: 48, marginBottom: 10 }} />
                      <h3 style={{ margin: 0 }}>Payment Verified!</h3>
                    </div>
                  )}
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: 14, fontSize: 16 }} 
                disabled={paymentMethod === 'UPI' && !qrScanned}
                onClick={completeTripWithPayment}
              >
                {paymentMethod === 'Cash' ? 'Confirm Cash Collected' : 'Complete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMyTrips;
