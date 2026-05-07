import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiShield, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiSave, FiCheck } from 'react-icons/fi';
import api from '../../services/api';

const DriverProfile = () => {
  const { user, login } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/email/${user.email}`);
        setUserData(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
      } catch (err) { console.error('Failed to fetch profile', err); }
    };
    fetchUser();
  }, [user]);

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const res = await api.put(`/users/${userData.userId}/profile`, form);
      setUserData(res.data);
      // Update local storage name
      login({ ...user, name: form.name });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); alert('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const displayData = userData || { name: user?.name, email: user?.email };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>My Profile</h1><p>View and manage your profile</p></div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 14, fontWeight: 600 }}>
          <FiCheck /> Profile updated successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white', margin: '0 auto 16px'
          }}>
            {displayData.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{displayData.name || 'User'}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{displayData.email}</p>
          <span className="badge badge-info" style={{ padding: '6px 16px' }}>
            {displayData.role?.roleName?.replace('ROLE_', '') || user?.role?.replace('ROLE_', '') || 'USER'}
          </span>
          <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Member Since</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Profile Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="form-group">
              <label>Full Name</label>
              {editing ? (
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 10, fontSize: 14 }}>
                  <FiUser style={{ color: 'var(--text-muted)' }} /> {displayData.name || 'N/A'}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 10, fontSize: 14 }}>
                <FiMail style={{ color: 'var(--text-muted)' }} /> {displayData.email || 'N/A'}
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 10, fontSize: 14 }}>
                <FiShield style={{ color: 'var(--text-muted)' }} /> {displayData.role?.roleName?.replace('ROLE_', '') || user?.role?.replace('ROLE_', '') || 'USER'}
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              {editing ? (
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 10, fontSize: 14 }}>
                  <FiPhone style={{ color: 'var(--text-muted)' }} /> {userData?.phone || 'Not provided'}
                </div>
              )}
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Address</label>
              {editing ? (
                <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Enter your address" style={{ resize: 'vertical' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 10, fontSize: 14 }}>
                  <FiMapPin style={{ color: 'var(--text-muted)' }} /> {userData?.address || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
