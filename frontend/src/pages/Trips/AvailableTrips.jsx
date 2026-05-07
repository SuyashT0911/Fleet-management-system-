import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTruck, FiMapPin, FiClock, FiDollarSign, FiSearch, FiFilter, FiArrowRight, FiCalendar, FiUsers, FiPlus, FiCheck, FiNavigation } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import api from '../../services/api';
import './AvailableTrips.css';

const AvailableTrips = () => {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ pickup: '', drop: '', startTime: '', vehicleType: '', notes: '', distance: '', paymentMethod: 'online' });
  const [vehicles, setVehicles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const { isAuthenticated, user } = useAuth();
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
      } catch (err) { console.error('Failed to fetch routes', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const vehicleTypes = [...new Set(vehicles.map(v => v.type).filter(Boolean))];

  const filtered = routes.filter(r => {
    const text = `${r.startLocation} ${r.endLocation} ${r.routeName || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleBookRoute = (routeId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/customer/book?route=${routeId}`);
    }
  };

  const handleCustomBook = async () => {
    if (!customForm.pickup.trim() || !customForm.drop.trim() || !customForm.startTime) {
      alert('Please fill Pickup Point, Drop Point, and Departure Time.'); return;
    }
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      // Truncate to prevent database 'data too long' errors (max 100 chars)
      const truncate = (str, n) => (str.length > n ? str.substr(0, n - 1) + '…' : str);
      const startLoc = truncate(customForm.pickup, 90);
      const endLoc = truncate(customForm.drop, 90);
      const rName = truncate(`${startLoc} → ${endLoc} (Private)`, 95);

      // Create a new custom route
      const routeRes = await api.post('/routes', {
        routeName: rName,
        startLocation: startLoc,
        endLocation: endLoc,
        distance: parseFloat(customForm.distance) || 0,
        publicRoute: false
      });

      // Find matching vehicle
      const matchingVehicle = vehicles.find(v =>
        (!customForm.vehicleType || v.type === customForm.vehicleType)
      );

      // Find customer record
      const customerRes = await api.get(`/users/email/${user.email}/customer`);

      // Create the trip
      await api.post('/trips', {
        route: { routeId: routeRes.data.routeId },
        vehicle: matchingVehicle ? { vehicleId: matchingVehicle.vehicleId } : null,
        customer: { customerId: customerRes.data.customerId },
        startTime: customForm.startTime,
        tripStatus: 'scheduled',
      });

      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setShowCustomForm(false);
        setCustomForm({ pickup: '', drop: '', startTime: '', vehicleType: '', notes: '', distance: '', paymentMethod: 'online' });
        navigate('/customer/dashboard');
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to book trip. ' + (err.response?.data?.message || 'Please try again.'));
    }
    finally { setSubmitting(false); }
  };

  return (
    <div className="available-trips-page">
      <PublicNavbar />

      <div className="trips-content">
        <div className="landing-container">
          <div className="trips-header">
            <h1>Available Routes & Trips</h1>
            <p>Browse our existing routes or create your own custom private trip with any pickup & drop point.</p>
          </div>

          {/* Custom Trip CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            borderRadius: 20, padding: '32px 36px', marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#312e81' }}>
                <FiNavigation style={{ marginRight: 8, color: '#6366f1' }} />
                Can't find your route?
              </h3>
              <p style={{ color: '#4338ca', fontSize: 15 }}>
                Create a custom private trip with any pickup & destination — we'll match you with the best vehicle and driver.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => {
              if (!isAuthenticated) { navigate('/login'); return; }
              setShowCustomForm(!showCustomForm);
            }} style={{ whiteSpace: 'nowrap' }}>
              <FiPlus /> {showCustomForm ? 'Hide Form' : 'Create Custom Trip'}
            </button>
          </div>

          {/* Custom Trip Form */}
          {showCustomForm && (
            <div className="card" style={{ marginBottom: 32, padding: 32, borderLeft: '4px solid #6366f1' }}>
              {booked ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(16,185,129,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, color: '#10b981' }}><FiCheck /></div>
                  <h3 style={{ marginBottom: 6 }}>Custom Trip Booked!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your dashboard...</p>
                </div>
              ) : (
                <>
                  <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiNavigation style={{ color: '#6366f1' }} /> Create Custom Private Trip
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Pickup Point *</label>
                      <input className="form-control" placeholder="e.g. Koregaon Park, Pune" value={customForm.pickup}
                        onChange={e => setCustomForm({ ...customForm, pickup: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Drop Point *</label>
                      <input className="form-control" placeholder="e.g. Hinjewadi Phase 3, Pune" value={customForm.drop}
                        onChange={e => setCustomForm({ ...customForm, drop: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Departure Date & Time *</label>
                      <input type="datetime-local" className="form-control" value={customForm.startTime}
                        onChange={e => setCustomForm({ ...customForm, startTime: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Preferred Vehicle Type</label>
                      <select className="form-control" value={customForm.vehicleType}
                        onChange={e => setCustomForm({ ...customForm, vehicleType: e.target.value })}>
                        <option value="">Any Available</option>
                        {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Est. Distance (km)</label>
                      <input type="number" className="form-control" placeholder="e.g. 15" value={customForm.distance}
                        onChange={e => setCustomForm({ ...customForm, distance: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Special Instructions</label>
                      <textarea className="form-control" rows={2} placeholder="Any special requirements, landmarks, etc."
                        value={customForm.notes} onChange={e => setCustomForm({ ...customForm, notes: e.target.value })}
                        style={{ resize: 'vertical' }} />
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
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowCustomForm(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCustomBook} disabled={submitting}>
                      {submitting ? 'Booking...' : 'Confirm & Book Custom Trip'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="trips-filters">
            <div className="search-bar" style={{ flex: 1 }}>
              <FiSearch className="search-icon" />
              <input type="text" className="form-control" placeholder="Search routes by city... (e.g., Pune, Mumbai, Delhi)" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            {loading ? 'Loading routes...' : `Showing ${filtered.length} available route${filtered.length !== 1 ? 's' : ''}`}
          </p>

          {/* Route Cards */}
          <div className="trips-list">
            {filtered.map(route => (
              <div key={route.routeId} className="trip-card">
                <div className="trip-card-header">
                  <div className="trip-route">
                    <span className="trip-city">{route.startLocation}</span>
                    <div className="trip-route-line">
                      <div className="trip-route-dot" />
                      <div className="trip-route-dash" />
                      <FiTruck style={{ color: 'var(--primary-light)', fontSize: 14 }} />
                      <div className="trip-route-dash" />
                      <div className="trip-route-dot" />
                    </div>
                    <span className="trip-city">{route.endLocation}</span>
                  </div>
                </div>

                <div className="trip-meta">
                  <span><FiMapPin /> {route.distance || '?'} km</span>
                  <span><FiClock /> {route.estimatedTime || 'N/A'}</span>
                  {route.routeName && <span><FiNavigation /> {route.routeName}</span>}
                </div>

                <div className="trip-card-footer">
                  <span className="badge badge-success">Available</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleBookRoute(route.routeId)}>
                    {isAuthenticated ? 'Book This Route' : 'Login to Book'} <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                <FiMapPin size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
                <p>No routes found. Try a different search or <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setShowCustomForm(true)}>create a custom trip</strong>.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default AvailableTrips;
