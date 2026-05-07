import React, { useState, useEffect } from 'react';
import { FiPlus, FiTool, FiSearch, FiAlertTriangle, FiCheckCircle, FiClock, FiEdit2 } from 'react-icons/fi';
import api from '../../services/api';

const statusConfig = {
  scheduled: { badge: 'badge-warning', icon: <FiClock />, color: '#f59e0b' },
  in_progress: { badge: 'badge-info', icon: <FiTool />, color: '#06b6d4' },
  completed: { badge: 'badge-success', icon: <FiCheckCircle />, color: '#10b981' },
};

const statusLabels = { scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed' };

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialForm = { vehicleId: '', type: 'Routine', status: 'scheduled', date: '', cost: '', workshop: '', description: '' };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
      setRecords(mRes.data);
      setVehicles(vRes.data);
    } catch (err) { console.error("Failed to fetch maintenance", err); }
    finally { setLoading(false); }
  };

  const filtered = records.filter(r => {
    const vNum = r.vehicle?.registrationNumber || '';
    const matchSearch = vNum.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const getCount = (status) => records.filter(r => r.status === status).length;

  const handleSave = async () => {
    if (!form.vehicleId || !form.type || !form.date) {
      alert('Vehicle, Type, and Date are required.'); return;
    }
    try {
      await api.post('/maintenance', {
        vehicle: { vehicleId: parseInt(form.vehicleId) },
        type: form.type,
        status: form.status,
        date: form.date,
        cost: form.cost ? parseFloat(form.cost) : null,
        workshop: form.workshop,
        description: form.description
      });
      fetchData();
      setShowModal(false);
      setForm(initialForm);
    } catch (err) {
      console.error("Failed to save maintenance", err);
      alert("Failed to save. " + (err.response?.data?.message || ''));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/maintenance/${id}`, { status: newStatus });
      fetchData();
    } catch (err) { console.error("Failed to update status", err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Failed to delete.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Maintenance & Repairs</h1><p>Track vehicle health, servicing, and repair costs</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Schedule Service</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setFilter('ALL')}>
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiTool /></div>
          <div className="kpi-info"><h3>All Records</h3><div className="kpi-value">{records.length}</div></div>
        </div>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === key ? cfg.color : undefined }} onClick={() => setFilter(key)}>
            <div className="kpi-icon" style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.icon}</div>
            <div className="kpi-info"><h3>{statusLabels[key]}</h3><div className="kpi-value" style={{ color: cfg.color }}>{getCount(key)}</div></div>
          </div>
        ))}
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Maintenance Log ({filtered.length})</h2>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search vehicle..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Date</th><th>Workshop</th><th>Cost</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>}
            {!loading && filtered.map(r => (
              <tr key={r.maintenanceId}>
                <td style={{ fontWeight: 600 }}>#{r.maintenanceId}</td>
                <td style={{ fontWeight: 600 }}>{r.vehicle?.registrationNumber || 'N/A'}</td>
                <td>{r.type}</td>
                <td><span className={`badge ${(statusConfig[r.status] || statusConfig.scheduled).badge}`}>{statusLabels[r.status] || r.status}</span></td>
                <td>{r.date}</td>
                <td>{r.workshop || '-'}</td>
                <td style={{ color: r.cost ? '#ef4444' : 'var(--text-muted)', fontWeight: 600 }}>{r.cost ? `₹${parseFloat(r.cost).toLocaleString()}` : '-'}</td>
                <td style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select className="form-control" value={r.status} onChange={(e) => handleStatusChange(r.maintenanceId, e.target.value)} style={{ width: 140, fontSize: 12, padding: '4px 8px' }}>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(r.maintenanceId)} title="Delete Record" style={{ padding: 6 }}>
                    <FiEdit2 style={{ display: 'none' }} />✕
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Schedule Maintenance</h2><button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Vehicle *</label>
                <select className="form-control" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.registrationNumber} ({v.vehicleType?.typeName || v.model})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Type *</label>
                  <select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="Routine">Routine Service</option><option value="Repairs">Repairs</option><option value="Inspection">Inspection</option>
                  </select>
                </div>
                <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Workshop/Location</label><input className="form-control" value={form.workshop} onChange={(e) => setForm({ ...form, workshop: e.target.value })} /></div>
                <div className="form-group"><label>Estimated Cost (₹)</label><input type="number" className="form-control" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Schedule</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
