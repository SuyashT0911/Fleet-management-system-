import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMapPin, FiClock, FiTruck, FiCalendar, FiCheck, FiDollarSign, FiNavigation, FiMap } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BookTrip = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Two modes: 'route' (pre-defined) or 'custom' (private trip)
  const [mode, setMode] = useState('route');

  const [form, setForm] = useState({
    routeId: '',
    vehicleType: '',
    startTime: '',
    pickupAddress: '',
    notes: '',
    paymentMethod: 'online'
  });

  // Custom trip fields
  const [customForm, setCustomForm] = useState({
    pickup: '',
    drop: '',
    startTime: '',
    vehicleType: '',
    notes: '',
    paymentMethod: 'online'
  });

  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, vehiclesRes] = await Promise.all([
          api.get('/routes'),
          api.get('/vehicles'),
        ]);
        setRoutes(routesRes.data);
        setVehicles(vehiclesRes.data.filter(v => v.status === 'active'));

        // Pre-select route if passed via URL param
        const preRouteId = searchParams.get('route');
        if (preRouteId) {
          const found = routesRes.data.find(r => r.routeId === parseInt(preRouteId));
          if (found) {
            setSelectedRoute(found);
            setForm(prev => ({ ...prev, routeId: found.routeId }));
          }
        }
      } catch (err) { console.error('Failed to fetch booking data', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [searchParams]);

  const availableVehicleTypes = [...new Set(vehicles.map(v => v.type).filter(Boolean))];

  // Book pre-defined route
  const handleBookRoute = async () => {
    if (!form.routeId || !form.startTime) {
      alert('Please select a route and departure time.'); return;
    }
    setSubmitting(true);
    try {
      const matchingVehicle = vehicles.find(v => (!form.vehicleType || v.type === form.vehicleType));
      const customerRes = await api.get(`/users/email/${user.email}/customer`);

      await api.post('/trips', {
        route: { routeId: parseInt(form.routeId) },
        vehicle: matchingVehicle ? { vehicleId: matchingVehicle.vehicleId } : null,
        customer: { customerId: customerRes.data.customerId },
        startTime: form.startTime,
        tripStatus: 'scheduled',
      });

      setBooked(true);
      setTimeout(() => navigate('/customer/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to book trip. ' + (err.response?.data?.message || 'Please try again.'));
    }
    finally { setSubmitting(false); }
  };

  // Book custom private trip
  const handleBookCustom = async () => {
    if (!customForm.pickup.trim() || !customForm.drop.trim() || !customForm.startTime) {
      alert('Please fill Pickup Point, Drop Point, and Departure Time.'); return;
    }
    setSubmitting(true);
    try {
      // Truncate to prevent database 'data too long' errors (max 100 chars)
      const truncate = (str, n) => (str.length > n ? str.substr(0, n - 1) + '…' : str);
      const startLoc = truncate(customForm.pickup, 90);
      const endLoc = truncate(customForm.drop, 90);
      const rName = truncate(`${startLoc} → ${endLoc} (Private)`, 95);

      // Create custom route
      const routeRes = await api.post('/routes', {
        routeName: rName,
        startLocation: startLoc,
        endLocation: endLoc,
        distance: 0,
        publicRoute: false
      });

      const matchingVehicle = vehicles.find(v => (!customForm.vehicleType || v.type === customForm.vehicleType));
      const customerRes = await api.get(`/users/email/${user.email}/customer`);

      await api.post('/trips', {
        route: { routeId: routeRes.data.routeId },
        vehicle: matchingVehicle ? { vehicleId: matchingVehicle.vehicleId } : null,
        customer: { customerId: customerRes.data.customerId },
        startTime: customForm.startTime,
        tripStatus: 'scheduled',
      });

      setBooked(true);
      setTimeout(() => navigate('/customer/dashboard'), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to book custom trip. ' + (err.response?.data?.message || 'Please try again.'));
    }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading available routes...</p>
    </div>
  );

  if (booked) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 48, maxWidth: 450 }}>
          <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28, color: '#10b981' }}><FiCheck /></div>
          <h2 style={{ marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            Your {mode === 'custom' ? 'custom private' : ''} trip has been booked successfully and is pending assignment.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Book a Trip</h1><p>Choose an existing route or create your own custom private trip</p></div>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button className={`btn ${mode === 'route' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('route')} style={{ flex: 1, justifyContent: 'center', padding: '14px 20px' }}>
          <FiMap style={{ marginRight: 8 }} /> Choose Existing Route
        </button>
        <button className={`btn ${mode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('custom')} style={{ flex: 1, justifyContent: 'center', padding: '14px 20px' }}>
          <FiNavigation style={{ marginRight: 8 }} /> Custom Private Trip
        </button>
      </div>

      {/* ============ MODE: Existing Route ============ */}
      {mode === 'route' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>Select Your Route *</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {routes.map(r => (
                  <div key={r.routeId} className="card" style={{
                    cursor: 'pointer', padding: 16,
                    borderColor: selectedRoute?.routeId === r.routeId ? 'var(--primary)' : undefined,
                    background: selectedRoute?.routeId === r.routeId ? 'var(--primary-glow)' : undefined,
                    boxShadow: 'none'
                  }}
                    onClick={() => { setSelectedRoute(r); setForm({ ...form, routeId: r.routeId }); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700 }}>{r.startLocation} → {r.endLocation}</h4>
                      {selectedRoute?.routeId === r.routeId && <FiCheck style={{ color: 'var(--primary)' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span><FiMapPin style={{ marginRight: 4 }} />{r.distance} km</span>
                      <span><FiClock style={{ marginRight: 4 }} />{r.estimatedTime || 'N/A'}</span>
                    </div>
                  </div>
                ))}
                {routes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', padding: 20 }}>No routes available. Try creating a <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setMode('custom')}>custom trip</strong> instead.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Booking Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select className="form-control" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                    <option value="">Any Available</option>
                    {availableVehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Departure Date & Time *</label>
                  <input type="datetime-local" className="form-control" value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Pickup Address</label>
                <input className="form-control" value={form.pickupAddress}
                  onChange={e => setForm({ ...form, pickupAddress: e.target.value })} placeholder="Exact pickup location" />
              </div>
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea className="form-control" rows={2} value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="online">Online (UPI/Card)</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ marginBottom: 20 }}>Booking Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <SummaryRow label="Route" value={selectedRoute ? `${selectedRoute.startLocation} → ${selectedRoute.endLocation}` : 'Not selected'} />
              <SummaryRow label="Distance" value={selectedRoute?.distance ? `${selectedRoute.distance} km` : '-'} />
              <SummaryRow label="Est. Duration" value={selectedRoute?.estimatedTime || '-'} />
              <SummaryRow label="Vehicle" value={form.vehicleType || 'Any'} />
              <SummaryRow label="Departure" value={form.startTime ? new Date(form.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Not set'} />
              <SummaryRow label="Payment" value={form.paymentMethod} capitalize />
            </div>
            <button className="btn btn-primary" disabled={!selectedRoute || !form.startTime || submitting}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: (!selectedRoute || !form.startTime) ? 0.5 : 1 }}
              onClick={handleBookRoute}>
              {submitting ? 'Booking...' : 'Confirm & Book Trip'}
            </button>
            {(!selectedRoute || !form.startTime) && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Select a route and departure time to book.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============ MODE: Custom Private Trip ============ */}
      {mode === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}><FiNavigation /></div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Custom Private Trip</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Enter any pickup & drop location — even unlisted destinations</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Pickup Point *</label>
                  <input className="form-control" placeholder="e.g. Koregaon Park, Pune"
                    value={customForm.pickup} onChange={e => setCustomForm({ ...customForm, pickup: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Drop Point *</label>
                  <input className="form-control" placeholder="e.g. Lavasa Hill Station"
                    value={customForm.drop} onChange={e => setCustomForm({ ...customForm, drop: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Departure Date & Time *</label>
                  <input type="datetime-local" className="form-control"
                    value={customForm.startTime} onChange={e => setCustomForm({ ...customForm, startTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Preferred Vehicle</label>
                  <select className="form-control" value={customForm.vehicleType}
                    onChange={e => setCustomForm({ ...customForm, vehicleType: e.target.value })}>
                    <option value="">Any Available</option>
                    {availableVehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Special Instructions / Landmarks</label>
                <textarea className="form-control" rows={3} placeholder="Describe exact pickup/drop landmarks, gate numbers, timing preferences..."
                  value={customForm.notes} onChange={e => setCustomForm({ ...customForm, notes: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" value={customForm.paymentMethod}
                  onChange={e => setCustomForm({ ...customForm, paymentMethod: e.target.value })}>
                  <option value="online">Online (UPI/Card)</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Summary */}
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ marginBottom: 20 }}>Custom Trip Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <SummaryRow label="Pickup" value={customForm.pickup || 'Not set'} bold={!!customForm.pickup} />
              <SummaryRow label="Drop" value={customForm.drop || 'Not set'} bold={!!customForm.drop} />
              <SummaryRow label="Type" value="Private Custom Trip" />
              <SummaryRow label="Vehicle" value={customForm.vehicleType || 'Any'} />
              <SummaryRow label="Departure" value={customForm.startTime ? new Date(customForm.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Not set'} />
              <SummaryRow label="Payment" value={customForm.paymentMethod} capitalize />
            </div>
            {customForm.pickup && customForm.drop && (
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#4338ca', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiNavigation /> A new route will be created for <strong>{customForm.pickup} → {customForm.drop}</strong>
              </div>
            )}
            <button className="btn btn-primary" disabled={!customForm.pickup || !customForm.drop || !customForm.startTime || submitting}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: (!customForm.pickup || !customForm.drop || !customForm.startTime) ? 0.5 : 1 }}
              onClick={handleBookCustom}>
              {submitting ? 'Booking...' : 'Confirm & Book Custom Trip'}
            </button>
            {(!customForm.pickup || !customForm.drop || !customForm.startTime) && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Fill pickup, drop point, and departure time.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Summary row helper
const SummaryRow = ({ label, value, bold, capitalize }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 400, textTransform: capitalize ? 'capitalize' : undefined }}>{value}</span>
  </div>
);

export default BookTrip;
