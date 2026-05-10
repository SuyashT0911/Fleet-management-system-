import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiShield, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiSave, FiCheck, FiLogOut, FiList } from 'react-icons/fi';
import api from '../../services/api';

const DriverProfile = () => {
  const { user, login } = useAuth();
  const [userData, setUserData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'leave'
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

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

        // Fetch driver profile
        try {
          const driverRes = await api.get(`/users/email/${user.email}/driver`);
          setDriverData(driverRes.data);
          
          // Fetch leave requests
          const leaveRes = await api.get(`/leaves/driver/${driverRes.data.driverId}`);
          setLeaveRequests(leaveRes.data);
        } catch (e) {
          console.error('Driver profile not found', e);
        }
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
      login({ ...user, name: form.name });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); alert('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      alert('Please fill all leave request fields');
      return;
    }
    if (!driverData) {
      alert('Driver profile not found.');
      return;
    }
    setLeaveSubmitting(true);
    try {
      await api.post('/leaves', {
        driver: { driverId: driverData.driverId },
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason
      });
      alert('Leave request submitted successfully');
      setLeaveForm({ fromDate: '', toDate: '', reason: '' });
      // Refresh leaves
      const leaveRes = await api.get(`/leaves/driver/${driverData.driverId}`);
      setLeaveRequests(leaveRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const displayData = userData || { name: user?.name, email: user?.email };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>My Profile</h1><p>View and manage your profile</p></div>
        {activeTab === 'profile' && !editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <FiEdit2 /> Edit Profile
          </button>
        )}
        {activeTab === 'profile' && editing && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
        >
          Profile Details
        </button>
        <button 
          onClick={() => setActiveTab('leave')} 
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'leave' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'leave' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
        >
          Leave Requests
        </button>
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

        {activeTab === 'profile' ? (
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Request Leave</h3>
              <form onSubmit={handleLeaveSubmit} style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>From Date *</label>
                    <input type="date" className="form-control" value={leaveForm.fromDate} onChange={e => setLeaveForm({...leaveForm, fromDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>To Date *</label>
                    <input type="date" className="form-control" value={leaveForm.toDate} onChange={e => setLeaveForm({...leaveForm, toDate: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason *</label>
                  <textarea className="form-control" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Please explain the reason for your leave" required />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={leaveSubmitting || !driverData}>
                    {leaveSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>My Leave Requests</h3>
              {leaveRequests.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No leave requests found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {leaveRequests.map(leave => (
                    <div key={leave.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{leave.reason}</div>
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div style={{ fontSize: 13, color: '#ef4444', marginTop: 4 }}><strong>Admin Note:</strong> {leave.rejectionReason}</div>
                        )}
                      </div>
                      <span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}`} style={{ textTransform: 'capitalize' }}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfile;
