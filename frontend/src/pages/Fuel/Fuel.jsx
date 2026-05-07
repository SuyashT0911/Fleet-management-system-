import React, { useState, useEffect } from 'react';
import { FiPlus, FiDroplet, FiSearch, FiTrendingUp, FiCreditCard, FiTruck, FiEdit2 } from 'react-icons/fi';
import api from '../../services/api';

const Fuel = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { vehicleId: '', quantity: '', cost: '', mileage: '', date: '' };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, vRes] = await Promise.all([api.get('/fuel'), api.get('/vehicles')]);
      setLogs(fRes.data);
      setVehicles(vRes.data);
    } catch (err) { console.error("Failed to fetch fuel logs", err); }
    finally { setLoading(false); }
  };

  const filtered = logs.filter(l => {
    const vNum = l.vehicle?.registrationNumber || '';
    const driverName = l.driver?.name || '';
    return vNum.toLowerCase().includes(search.toLowerCase()) || driverName.toLowerCase().includes(search.toLowerCase());
  });

  const getTotalCost = () => logs.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const getTotalLiters = () => logs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

  const openEdit = (log) => {
    setEditingId(log.fuelId);
    setForm({
      vehicleId: log.vehicle?.vehicleId || '',
      quantity: log.quantity || '',
      cost: log.cost || '',
      mileage: log.mileage || '',
      date: log.date || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.vehicleId || !form.quantity || !form.cost || !form.date) {
      alert('Vehicle, Quantity, Cost, and Date are required.'); return;
    }
    try {
      const payload = {
        vehicle: { vehicleId: parseInt(form.vehicleId) },
        quantity: parseFloat(form.quantity),
        cost: parseFloat(form.cost),
        mileage: form.mileage ? parseFloat(form.mileage) : null,
        date: form.date
      };
      if (editingId) {
        await api.put(`/fuel/${editingId}`, payload);
      } else {
        await api.post('/fuel', payload);
      }
      fetchData();
      setShowModal(false);
      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save fuel log", err);
      alert("Failed to save. " + (err.response?.data?.message || ''));
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Fuel Monitoring</h1><p>Track fuel consumption and expenses across your fleet</p></div>
        <button className="btn btn-primary" onClick={openNew}><FiPlus /> Add Log</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiDroplet /></div>
          <div className="kpi-info"><h3>All Logs</h3><div className="kpi-value">{logs.length}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><FiTrendingUp /></div>
          <div className="kpi-info"><h3>Total Liters</h3><div className="kpi-value" style={{ color: '#06b6d4' }}>{getTotalLiters().toLocaleString()}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiCreditCard /></div>
          <div className="kpi-info"><h3>Total Spent</h3><div className="kpi-value" style={{ color: '#ef4444' }}>₹{getTotalCost().toLocaleString()}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiTruck /></div>
          <div className="kpi-info"><h3>Vehicles</h3><div className="kpi-value">{new Set(logs.map(l => l.vehicle?.vehicleId).filter(Boolean)).size}</div></div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Fuel Logs ({filtered.length})</h2>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search vehicle or driver..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Date</th><th>Vehicle</th><th>Driver</th><th>Trip</th><th>Liters</th><th>Mileage</th><th>Cost</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>}
            {!loading && filtered.map(l => (
              <tr key={l.fuelId}>
                <td style={{ fontWeight: 600 }}>#{l.fuelId}</td>
                <td>{l.date}</td>
                <td style={{ fontWeight: 600 }}>{l.vehicle?.registrationNumber || 'N/A'}</td>
                <td>{l.driver?.name || '-'}</td>
                <td>{l.trip ? `#${l.trip.tripId}` : '-'}</td>
                <td>{l.quantity || '-'} L</td>
                <td>{l.mileage || '-'} km</td>
                <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{parseFloat(l.cost).toLocaleString()}</td>
                <td>
                  <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => openEdit(l)}>
                    <FiEdit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No logs found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingId(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingId ? 'Edit Fuel Log' : 'Add Fuel Log'}</h2><button className="btn btn-icon btn-secondary" onClick={() => { setShowModal(false); setEditingId(null); }}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Vehicle *</label>
                <select className="form-control" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.registrationNumber} ({v.vehicleType?.typeName || v.model})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Liters *</label><input type="number" className="form-control" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
                <div className="form-group"><label>Total Cost (₹) *</label><input type="number" className="form-control" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required /></div>
              </div>
              <div className="form-group"><label>Odometer/Mileage (km)</label><input type="number" className="form-control" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingId(null); }}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Update Log' : 'Save Log'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fuel;
