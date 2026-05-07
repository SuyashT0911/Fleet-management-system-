import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiSearch, FiTruck, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Navbar.css';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/vehicles': 'Vehicle Management',
  '/admin/drivers': 'Driver Management',
  '/admin/trips': 'Trip Management',
  '/admin/maintenance': 'Maintenance Tracking',
  '/admin/fuel': 'Fuel Monitoring',
  '/admin/payments': 'Payments & Invoicing',
  '/admin/reports': 'Reports & Analytics',
  '/admin/users': 'User Management',
  '/driver/dashboard': 'Driver Dashboard',
  '/driver/my-trips': 'My Trips',
  '/driver/assigned': 'Assigned Trips',
  '/driver/incidents': 'Incidents',
  '/driver/profile': 'My Profile',
  '/customer/dashboard': 'My Dashboard',
  '/customer/book': 'Book a Trip',
  '/customer/my-trips': 'My Bookings',
  '/customer/history': 'Trip History',
  '/customer/profile': 'My Profile',
};

const sampleNotifications = [
  { id: 1, title: 'Trip #156 Completed', desc: 'Pune to Mumbai trip has been successfully completed.', time: '2 mins ago', type: 'success', icon: <FiCheckCircle /> },
  { id: 2, title: 'Incident Reported', desc: 'Driver Rajesh reported a flat tire near Lonavala.', time: '45 mins ago', type: 'danger', icon: <FiAlertTriangle /> },
  { id: 3, title: 'Vehicle Maintenance', desc: 'MH-12-CD-5678 is scheduled for maintenance today.', time: '2 hours ago', type: 'warning', icon: <FiTruck /> },
];

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'FleetPro';
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUnread();
    }
  }, [user]);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setNotifications(res.data);
    } catch (err) { console.error('Failed to fetch notifications', err); }
  };

  const handleNotifClick = async (notif) => {
    setSelectedNotif(notif);
    setShowNotifications(false);
    try {
      await api.put(`/notifications/${notif.notificationId}/read`);
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheckCircle />;
      case 'danger': return <FiAlertTriangle />;
      case 'warning': return <FiAlertTriangle />;
      default: return <FiBell />;
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-search">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search anything..." />
        </div>

        <div className="notification-wrapper" ref={dropdownRef}>
          <button 
            className="navbar-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {notifications.length > 0 && <span className="notification-dot" />}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="badge badge-info">{notifications.length} New</span>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.notificationId} className="notification-item" onClick={() => handleNotifClick(notif)} style={{ cursor: 'pointer' }}>
                      <div className={`notification-icon ${notif.type}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">{notif.title}</p>
                        <p className="notification-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{notif.message}</p>
                        <p className="notification-time">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)} style={{ zIndex: 9999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, borderRadius: 12, overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 18 }}>Notification Detail</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelectedNotif(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className={`notification-icon ${selectedNotif.type}`} style={{ fontSize: 24, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }}>
                  {getIcon(selectedNotif.type)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{selectedNotif.title}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(selectedNotif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.6 }}>
                {selectedNotif.message}
              </div>
              
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Source</label>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 13 }}>{selectedNotif.relatedType || 'System Alert'}</p>
                </div>
                <div>
                  <label style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 1 }}>Reference</label>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 13 }}>#{selectedNotif.relatedId || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedNotif(null)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
