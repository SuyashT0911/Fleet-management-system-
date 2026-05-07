import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiSend } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const driverRes = await api.get(`/users/email/${user.email}/driver`);
        const res = await api.get(`/incidents/driver/${driverRes.data.driverId}`);
        setIncidents(res.data);
      } catch (err) {
        console.error('Failed to fetch incidents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [user.email]);

  if (loading) return <div className="page-content"><p>Loading incidents...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>My Incidents</h1><p>Track incidents reported during your trips</p></div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header"><h2>Incident Reports ({incidents.length})</h2></div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Trip</th><th>Type</th><th>Description</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.incidentId}>
                <td style={{ fontWeight: 600 }}>#{inc.incidentId}</td>
                <td>{inc.trip ? `Trip #${inc.trip.tripId}` : 'N/A'}</td>
                <td>{inc.type}</td>
                <td style={{ maxWidth: 300, whiteSpace: 'normal' }}>{inc.description}</td>
                <td>{inc.date ? new Date(inc.date).toLocaleDateString() : 'N/A'}</td>
                <td><span className={`badge ${inc.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{inc.status || 'Pending'}</span></td>
              </tr>
            ))}
            {incidents.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No incidents reported</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverIncidents;
