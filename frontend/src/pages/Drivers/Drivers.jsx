import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiStar, FiActivity, FiUserX } from 'react-icons/fi';
import api from '../../services/api';

const statusConfig = {
  active: { label: 'Available', badge: 'badge-success' },
  on_trip: { label: 'On Trip', badge: 'badge-info' },
  on_leave: { label: 'On Leave', badge: 'badge-danger' },
  available: { label: 'Available', badge: 'badge-success' },
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialForm = { name: '', contactNumber: '', licenseNumber: '', status: 'active', experienceYears: 0 };
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try { const res = await api.get('/drivers'); setDrivers(res.data); }
    catch (err) { console.error("Failed to fetch drivers", err); }
    finally { setLoading(false); }
  };

  const filtered = drivers.filter(d => {
    const matchSearch = (d.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const getCount = (status) => drivers.filter(d => d.status === status).length;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contactNumber || !form.licenseNumber) {
      alert('All fields are mandatory. Please fill in Name, Contact, and License No.');
      return;
    }
    try {
      const payload = { ...form, experienceYears: parseInt(form.experienceYears) || 0 };
      if (editId) {
        await api.put(`/drivers/${editId}`, payload);
      } else {
        await api.post('/drivers', payload);
      }
      fetchDrivers();
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    } catch (err) {
      console.error("Failed to save driver", err);
      alert("Failed to save driver. " + (err.response?.data?.message || ''));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try { await api.delete(`/drivers/${id}`); fetchDrivers(); }
    catch (err) { console.error("Failed to delete driver", err); alert("Failed to delete."); }
  };

  const openEdit = (d) => {
    setForm({
      name: d.name || '', contactNumber: d.contactNumber || '', licenseNumber: d.licenseNumber || '',
      status: d.status || 'active', experienceYears: d.experienceYears || 0
    });
    setEditId(d.driverId);
    setShowModal(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Driver Management</h1><p>Monitor your drivers, their statuses, and performance ratings</p></div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(initialForm); setShowModal(true); }}><FiPlus /> Add Driver</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setFilter('ALL')}>
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiUsers /></div>
          <div className="kpi-info"><h3>All Drivers</h3><div className="kpi-value">{drivers.length}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'active' ? '#10b981' : undefined }} onClick={() => setFilter('active')}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiUsers /></div>
          <div className="kpi-info"><h3>Active</h3><div className="kpi-value" style={{ color: '#10b981' }}>{getCount('active')}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'on_trip' ? '#06b6d4' : undefined }} onClick={() => setFilter('on_trip')}>
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><FiActivity /></div>
          <div className="kpi-info"><h3>On Trip</h3><div className="kpi-value" style={{ color: '#06b6d4' }}>{getCount('on_trip')}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'on_leave' ? '#ef4444' : undefined }} onClick={() => setFilter('on_leave')}>
          <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiUserX /></div>
          <div className="kpi-info"><h3>On Leave</h3><div className="kpi-value" style={{ color: '#ef4444' }}>{getCount('on_leave')}</div></div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Drivers List ({filtered.length})</h2>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search driver name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Contact</th><th>License No.</th><th>Experience</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading drivers...</td></tr>}
            {!loading && filtered.map(d => (
              <tr key={d.driverId}>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{(d.name || '?').charAt(0)}</div>
                    {d.name}
                  </div>
                </td>
                <td>{d.contactNumber}</td>
                <td>{d.licenseNumber}</td>
                <td>{d.experienceYears || 0} yrs</td>
                <td><span className={`badge ${(statusConfig[d.status] || statusConfig.active).badge}`}>{(statusConfig[d.status] || statusConfig.active).label}</span></td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 600 }}><FiStar /> {parseFloat(d.rating) || 0}</div></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(d)}><FiEdit2 /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(d.driverId)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No drivers found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Edit Driver' : 'Add Driver'}</h2><button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Contact Number *</label><input className="form-control" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required /></div>
              <div className="form-group"><label>License No. *</label><input className="form-control" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Experience (Years)</label><input type="number" className="form-control" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></div>
                <div className="form-group"><label>Status</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option><option value="on_trip">On Trip</option><option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add Driver'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
