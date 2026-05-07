import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiDollarSign, FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

const statusConfig = {
  completed: { label: 'Completed', badge: 'badge-success', icon: <FiCheckCircle />, color: '#10b981' },
  pending: { label: 'Pending', badge: 'badge-warning', icon: <FiClock />, color: '#f59e0b' },
  failed: { label: 'Failed', badge: 'badge-danger', icon: <FiAlertCircle />, color: '#ef4444' },
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [editId, setEditId] = useState(null);
  const initialForm = { tripId: '', amount: '', paymentDate: '', method: 'UPI', status: 'completed' };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([api.get('/payments'), api.get('/trips')]);
      setPayments(pRes.data);
      setTrips(tRes.data);
    } catch (err) { console.error("Failed to fetch payments", err); }
    finally { setLoading(false); }
  };

  const filtered = payments.filter(p => {
    const customerName = p.trip?.customer?.name || '';
    const matchSearch = customerName.toLowerCase().includes(search.toLowerCase()) || String(p.paymentId).includes(search);
    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const getTotalAmount = (status) => payments.filter(p => status === 'ALL' || p.status === status).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSave = async () => {
    if (!form.tripId || !form.amount || !form.paymentDate) {
      alert('Trip, Amount, and Date are required.'); return;
    }
    try {
      const payload = {
        trip: { tripId: parseInt(form.tripId) },
        amount: parseFloat(form.amount),
        paymentDate: form.paymentDate,
        method: form.method,
        status: form.status
      };
      if (editId) {
        await api.put(`/payments/${editId}`, payload);
      } else {
        await api.post('/payments', payload);
      }
      fetchData();
      setShowModal(false);
      setForm(initialForm);
      setEditId(null);
    } catch (err) {
      console.error("Failed to save payment", err);
      alert("Failed to save payment. " + (err.response?.data?.message || ''));
    }
  };

  const handleRowClick = (p) => {
    setForm({
      tripId: p.trip?.tripId || '',
      amount: p.amount || '',
      paymentDate: p.paymentDate || '',
      method: p.method || 'UPI',
      status: p.status || 'pending'
    });
    setEditId(p.paymentId);
    setShowModal(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Payments & Invoicing</h1><p>Manage customer payments, invoice status, and revenue</p></div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(initialForm); setShowModal(true); }}><FiPlus /> Record Payment</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setFilter('ALL')}>
           <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiCreditCard /></div>
           <div className="kpi-info"><h3>All Payments</h3><div className="kpi-value">₹{getTotalAmount('ALL').toLocaleString()}</div></div>
        </div>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="kpi-card" style={{ cursor: 'pointer', borderColor: filter === key ? cfg.color : undefined }} onClick={() => setFilter(key)}>
            <div className="kpi-icon" style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.icon}</div>
            <div className="kpi-info"><h3>{cfg.label}</h3><div className="kpi-value" style={{ color: cfg.color }}>₹{getTotalAmount(key).toLocaleString()}</div></div>
          </div>
        ))}
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Payment Records ({filtered.length})</h2>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search customer or ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Trip</th><th>Date</th><th>Method</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>}
            {!loading && filtered.map(p => (
              <tr key={p.paymentId} onClick={() => handleRowClick(p)} style={{ cursor: 'pointer' }} title="Click to edit">
                <td style={{ fontWeight: 600 }}>PAY-{p.paymentId}</td>
                <td>Trip #{p.trip?.tripId || '-'}</td>
                <td>{p.paymentDate}</td>
                <td>{p.method}</td>
                <td><span className={`badge ${(statusConfig[p.status] || statusConfig.pending).badge}`}>{(statusConfig[p.status] || statusConfig.pending).label}</span></td>
                <td style={{ color: p.status === 'completed' ? '#10b981' : 'var(--text-primary)', fontWeight: 600 }}>₹{parseFloat(p.amount).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payments found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>{editId ? 'Update Payment' : 'Record Payment'}</h2><button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Trip *</label>
                <select className="form-control" value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })} required>
                  <option value="">Select Trip</option>
                  {trips.map(t => <option key={t.tripId} value={t.tripId}>Trip #{t.tripId} - {t.route?.startLocation || '?'} → {t.route?.endLocation || '?'}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Amount (₹) *</label><input type="number" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 <div className="form-group"><label>Payment Method</label>
                  <select className="form-control" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option><option value="Credit Card">Credit Card</option><option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="form-group"><label>Status</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Record</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
