import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiUsers, FiShield, FiTruck as FiDriverIcon, FiUser, FiRefreshCw } from 'react-icons/fi';
import { getUsers, updateUserRole, updateUserStatus, deleteUser } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';

const roleConfig = {
  ROLE_ADMIN: { label: 'Admin', badge: 'badge-danger', icon: <FiShield /> },
  ROLE_DRIVER: { label: 'Driver', badge: 'badge-info', icon: <FiDriverIcon /> },
  ROLE_CUSTOMER: { label: 'Customer', badge: 'badge-success', icon: <FiUser /> },
};

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('ROLE_CUSTOMER');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!editUser) return;
    try {
      await updateUserRole(editUser.userId, selectedRole);
      alert('Role updated successfully!');
      fetchUsers();
      setShowModal(false);
      setEditUser(null);
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update role. Check console.');
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(user.userId, newStatus);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user.');
    }
  };

  const openRoleModal = (user) => {
    setEditUser(user);
    setSelectedRole(user.role?.roleName || 'ROLE_CUSTOMER');
    setShowModal(true);
  };

  const filtered = users.filter(u => {
    const roleName = u.role?.roleName || 'ROLE_CUSTOMER';
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || roleName === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleName = (u) => u.role?.roleName || 'ROLE_CUSTOMER';
  const admins = users.filter(u => getRoleName(u) === 'ROLE_ADMIN').length;
  const drivers = users.filter(u => getRoleName(u) === 'ROLE_DRIVER').length;
  const customers = users.filter(u => getRoleName(u) === 'ROLE_CUSTOMER').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>User Management</h1><p>Manage all registered users — assign roles, activate/deactivate accounts</p></div>
        <button className="btn btn-secondary" onClick={fetchUsers}><FiRefreshCw /> Refresh</button>
      </div>

      {/* Role summary cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: roleFilter === 'ALL' ? 'var(--primary)' : undefined }} onClick={() => setRoleFilter('ALL')}>
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><FiUsers /></div>
          <div className="kpi-info"><h3>All Users</h3><div className="kpi-value">{users.length}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: roleFilter === 'ROLE_ADMIN' ? '#ef4444' : undefined }} onClick={() => setRoleFilter('ROLE_ADMIN')}>
          <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiShield /></div>
          <div className="kpi-info"><h3>Admins</h3><div className="kpi-value" style={{ color: '#ef4444' }}>{admins}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: roleFilter === 'ROLE_DRIVER' ? '#06b6d4' : undefined }} onClick={() => setRoleFilter('ROLE_DRIVER')}>
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><FiDriverIcon /></div>
          <div className="kpi-info"><h3>Drivers</h3><div className="kpi-value" style={{ color: '#06b6d4' }}>{drivers}</div></div>
        </div>
        <div className="kpi-card" style={{ cursor: 'pointer', borderColor: roleFilter === 'ROLE_CUSTOMER' ? '#10b981' : undefined }} onClick={() => setRoleFilter('ROLE_CUSTOMER')}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiUser /></div>
          <div className="kpi-info"><h3>Customers</h3><div className="kpi-value" style={{ color: '#10b981' }}>{customers}</div></div>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="data-table-header">
          <h2>Users ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140, padding: '8px 12px', fontSize: 13 }}>
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input type="text" className="form-control" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 250 }} />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading users from database...</td></tr>}
            {!loading && filtered.map((u) => {
              const roleName = getRoleName(u);
              const isCurrentUser = currentUser && u.email === currentUser.email;
              return (
                <tr key={u.userId} style={{ backgroundColor: isCurrentUser ? 'var(--bg-hover)' : undefined }}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {u.name.charAt(0)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {u.name}
                        {isCurrentUser && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 12 }}>(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${roleConfig[roleName]?.badge || 'badge-default'}`}>
                      {roleConfig[roleName]?.label || roleName}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleStatusToggle(u)}
                      title="Click to toggle status"
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openRoleModal(u)} title="Assign Role">
                        <FiShield /> Assign Role
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(u.userId)} title="Delete User"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Role Assignment Modal */}
      {showModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Role to {editUser.name}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
                Current role: <strong>{getRoleName(editUser).replace('ROLE_', '')}</strong>.
                Select a new role below. The user's dashboard will change accordingly on their next login.
              </p>
              <div className="form-group">
                <label>Select Role</label>
                <select className="form-control" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="ROLE_CUSTOMER">Customer</option>
                  <option value="ROLE_DRIVER">Driver</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {['ROLE_CUSTOMER', 'ROLE_DRIVER', 'ROLE_ADMIN'].map(r => (
                  <div key={r} onClick={() => setSelectedRole(r)} style={{
                    flex: 1, padding: 16, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                    border: selectedRole === r ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedRole === r ? 'var(--primary-glow)' : 'var(--bg-hover)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>
                      {r === 'ROLE_ADMIN' ? '🛡️' : r === 'ROLE_DRIVER' ? '🚛' : '👤'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.replace('ROLE_', '')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRoleChange}>Assign Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
