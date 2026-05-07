import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiTool, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const statusConfig = {
  available: { label: 'Available', badge: 'badge-success', icon: <FiCheckCircle />, color: '#10b981' },
  in_transit: { label: 'In Transit', badge: 'badge-info', icon: <FiTruck />, color: '#06b6d4' },
  maintenance: { label: 'Maintenance', badge: 'badge-warning', icon: <FiTool />, color: '#f59e0b' },
  out_of_service: { label: 'Out of Service', badge: 'badge-danger', icon: <FiAlertCircle />, color: '#ef4444' },
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    registrationNumber: '', vehicleType: { typeName: 'Truck' }, capacity: '', status: 'available', healthScore: 100,
    insuranceProvider: '', insuranceExpiry: '', model: '', year: new Date().getFullYear(), chassisNumber: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) { console.error("Failed to fetch vehicles", err); }
    finally { setLoading(false); }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = (v.registrationNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || v.status === filter;
    return matchSearch && matchFilter;
  });

  const getCount = (status) => vehicles.filter(v => v.status === status).length;

  const handleSave = async (e) => {
    e.preventDefault();
    // Validation
    if (!form.registrationNumber || !form.model || !form.capacity || !form.chassisNumber || !form.insuranceProvider || !form.insuranceExpiry) {
      alert('All fields are mandatory. Please fill in every field.');
      return;
    }
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) || 0, year: parseInt(form.year) || new Date().getFullYear(), healthScore: parseFloat(form.healthScore) || 100 };
      if (editId) {
        await api.put(`/vehicles/${editId}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      fetchVehicles();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save vehicle", err);
      alert("Failed to save vehicle. " + (err.response?.data?.message || 'Please try again.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try { await api.delete(`/vehicles/${id}`); fetchVehicles(); }
    catch (err) { console.error("Failed to delete vehicle", err); alert("Failed to delete."); }
  };

  const handleCloseModal = () => { setShowModal(false); setFormStep(1); setForm(initialForm); setEditId(null); };

  const openEdit = (v) => {
    setForm({
      registrationNumber: v.registrationNumber || '',
      vehicleType: v.vehicleType || { typeName: 'Truck' },
      capacity: v.capacity || '',
      status: v.status || 'available',
      healthScore: v.healthScore || 100,
      insuranceProvider: v.insuranceProvider || '',
      insuranceExpiry: v.insuranceExpiry || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      chassisNumber: v.chassisNumber || ''
    });
    setEditId(v.vehicleId);
    setFormStep(1);
    setShowModal(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Vehicle Management</h1><p>Track your entire fleet, health status, and availability</p></div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setFormStep(1); setForm(initialForm); setShowModal(true); }}><FiPlus /> Add Vehicle</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setFilter('ALL')}>
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiTruck /></div>
          <div className="kpi-info"><h3>Total Fleet</h3><div className="kpi-value">{vehicles.length}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'available' ? '#10b981' : undefined }} onClick={() => setFilter('available')}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiCheckCircle /></div>
          <div className="kpi-info"><h3>Available</h3><div className="kpi-value" style={{ color: '#10b981' }}>{getCount('available')}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'in_transit' ? '#06b6d4' : undefined }} onClick={() => setFilter('in_transit')}>
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><FiTruck /></div>
          <div className="kpi-info"><h3>In Transit</h3><div className="kpi-value" style={{ color: '#06b6d4' }}>{getCount('in_transit')}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'maintenance' ? '#f59e0b' : undefined }} onClick={() => setFilter('maintenance')}>
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><FiTool /></div>
          <div className="kpi-info"><h3>Maintenance</h3><div className="kpi-value" style={{ color: '#f59e0b' }}>{getCount('maintenance')}</div></div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Vehicles List ({filtered.length})</h2>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search vehicle number..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Reg. Number</th><th>Type</th><th>Model</th><th>Capacity</th><th>Status</th><th>Health</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading vehicles from database...</td></tr>}
            {!loading && filtered.map(v => {
              const health = parseFloat(v.healthScore) || 0;
              return (
              <tr key={v.vehicleId}>
                <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                <td>{v.vehicleType?.typeName || '-'}</td>
                <td>{v.model} <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{v.year}</span></td>
                <td>{v.capacity}</td>
                <td><span className={`badge ${(statusConfig[v.status] || statusConfig.available).badge}`}>{(statusConfig[v.status] || statusConfig.available).label}</span></td>
                <td style={{ width: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${health}%`, background: health > 80 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{health}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(v)}><FiEdit2 /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(v.vehicleId)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            )})}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 600 }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2>{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={handleCloseModal}>✕</button>
            </div>
            <div style={{ display: 'flex', padding: '0 24px 24px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, height: 4, background: formStep >= 1 ? 'var(--primary)' : 'var(--border)', borderRadius: 2 }} />
              <div style={{ width: 8 }} />
              <div style={{ flex: 1, height: 4, background: formStep >= 2 ? 'var(--primary)' : 'var(--border)', borderRadius: 2 }} />
            </div>
            <form onSubmit={handleSave}>
            <div className="modal-body">
              {formStep === 1 && (
                <div className="form-step-animation">
                  <h3 style={{ marginBottom: 16, fontSize: 15, color: 'var(--primary-light)' }}>Step 1: General Details</h3>
                  <div className="form-group"><label>Vehicle Number *</label><input className="form-control" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="e.g. MH-12-AB-1234" required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group"><label>Type *</label>
                      <select className="form-control" value={form.vehicleType?.typeName || ''} 
                        onChange={(e) => {
                          const type = e.target.value;
                          let cap = form.capacity;
                          if (type === 'Bike') cap = 1;
                          if (type === 'Car') cap = 4;
                          if (type === 'Mini Bus') cap = 15;
                          if (type === 'Luxury Bus') cap = 40;
                          setForm({ ...form, vehicleType: { typeName: type }, capacity: cap });
                        }} required>
                        <option value="">Select Type</option>
                        <option value="Bike">Bike</option>
                        <option value="Car">Car</option>
                        <option value="Mini Bus">Mini Bus</option>
                        <option value="Luxury Bus">Luxury Bus</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Capacity *</label><input type="number" className="form-control" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 10" required /></div>
                  </div>
                  <div className="form-group"><label>Status *</label>
                    <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
                      <option value="available">Available</option><option value="in_transit">In Transit</option><option value="maintenance">Maintenance</option><option value="out_of_service">Out of Service</option>
                    </select>
                  </div>
                  {editId && <div className="form-group"><label>Health Score (%)</label><input type="number" className="form-control" min={0} max={100} value={form.healthScore} onChange={(e) => setForm({ ...form, healthScore: parseFloat(e.target.value) })} /></div>}
                </div>
              )}
              {formStep === 2 && (
                <div className="form-step-animation">
                  <h3 style={{ marginBottom: 16, fontSize: 15, color: 'var(--primary-light)' }}>Step 2: Technical & Compliance</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group"><label>Manufacturer/Model *</label><input className="form-control" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Tata Prima" required /></div>
                    <div className="form-group"><label>Manufacturing Year *</label><input type="number" className="form-control" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required /></div>
                  </div>
                  <div className="form-group"><label>Chassis Number *</label><input className="form-control" value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} placeholder="VIN / Chassis No." required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group"><label>Insurance Provider *</label><input className="form-control" value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} placeholder="e.g. ICICI Lombard" required /></div>
                    <div className="form-group"><label>Insurance Expiry Date *</label><input type="date" className="form-control" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} required /></div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {formStep === 1 ? (
                <>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={() => {
                    if (!form.registrationNumber || !form.capacity) { alert('Please fill Vehicle Number and Capacity.'); return; }
                    setFormStep(2);
                  }}>Next Step ➔</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setFormStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update Vehicle Details' : 'Submit & Add Vehicle'}</button>
                </>
              )}
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
