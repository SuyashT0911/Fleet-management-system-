import React, { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiMapPin, FiTruck, FiClock, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverAssigned = () => {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      const userRes = await api.get(`/users/email/${user.email}`);
      const driversRes = await api.get('/drivers');
      const myDriver = driversRes.data.find(d => d.user?.userId === userRes.data.userId);
      if (myDriver) {
        const tripsRes = await api.get(`/trips/driver/${myDriver.driverId}`);
        // Only show 'scheduled' trips in the Assigned requests page
        setAssigned(tripsRes.data.filter(t => t.tripStatus === 'scheduled'));
      }
    } catch (err) {
      console.error('Failed to fetch assigned trips', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const handleAccept = async (trip) => {
    try {
      await api.put(`/trips/${trip.tripId}`, { ...trip, tripStatus: 'accepted' });
      alert(`Trip #${trip.tripId} accepted! Moving to My Trips.`);
      fetchTrips();
    } catch (err) {
      alert("Failed to accept trip.");
    }
  };

  const handleReject = (id) => {
    // In a real app, this might unassign the driver
    alert("Declining trips is currently restricted by admin.");
  };

  if (loading) return <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><p style={{ color: 'var(--text-muted)' }}>Loading assignments...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Assigned Trips</h1><p>Review and accept trip assignments from fleet admin</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {assigned.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No pending assignments.</div>
        )}
        {assigned.map(trip => (
          <div key={trip.tripId} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{trip.route?.startLocation || '?'} → {trip.route?.endLocation || '?'}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Customer: {trip.customer?.name || 'N/A'}</p>
              </div>
              <span className="badge badge-warning">NEW REQUEST</span>
            </div>

            <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiMapPin style={{ color: '#6366f1' }} /> {trip.route?.distance || 0} km</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiClock style={{ color: '#06b6d4' }} /> {trip.startTime ? new Date(trip.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiCalendar style={{ color: '#10b981' }} /> {trip.startTime ? new Date(trip.startTime).toLocaleDateString() : 'N/A'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiTruck style={{ color: '#f59e0b' }} /> {trip.vehicle?.registrationNumber || 'N/A'}</div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#059669', fontWeight: 800, fontSize: 18 }}></div>
              <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => handleReject(trip.tripId)}>Decline</button>
                <button className="btn btn-primary" onClick={() => handleAccept(trip)}>Accept Trip</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverAssigned;
