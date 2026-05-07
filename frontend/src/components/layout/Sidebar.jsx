import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiTruck, FiUsers, FiMap, FiTool, FiDroplet,
  FiCreditCard, FiBarChart2, FiLogOut,
  FiChevronLeft, FiChevronRight, FiMenu
} from 'react-icons/fi';
import './Sidebar.css';

const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { path: '/admin/vehicles', label: 'Vehicles', icon: <FiTruck /> },
  { path: '/admin/drivers', label: 'Drivers', icon: <FiUsers /> },
  { path: '/admin/trips', label: 'Trips', icon: <FiMap /> },
  { path: '/admin/maintenance', label: 'Maintenance', icon: <FiTool /> },
  { path: '/admin/fuel', label: 'Fuel Logs', icon: <FiDroplet /> },
  { path: '/admin/payments', label: 'Payments', icon: <FiCreditCard /> },
  { path: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
  { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
];

const driverMenu = [
  { path: '/driver/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { path: '/driver/my-trips', label: 'My Trips', icon: <FiMap /> },
  { path: '/driver/assigned', label: 'Assigned Trips', icon: <FiTruck /> },
  { path: '/driver/incidents', label: 'Incidents', icon: <FiTool /> },
  { path: '/driver/profile', label: 'My Profile', icon: <FiUsers /> },
];

const customerMenu = [
  { path: '/customer/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { path: '/customer/book', label: 'Book a Trip', icon: <FiMap /> },
  { path: '/customer/my-trips', label: 'My Bookings', icon: <FiTruck /> },
  { path: '/customer/history', label: 'Trip History', icon: <FiBarChart2 /> },
  { path: '/customer/profile', label: 'My Profile', icon: <FiUsers /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  const role = user?.role || 'ROLE_ADMIN';
  let menuItems = adminMenu;
  if (role === 'ROLE_DRIVER') menuItems = driverMenu;
  else if (role === 'ROLE_CUSTOMER') menuItems = customerMenu;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none', opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto', overflow: 'hidden', pointerEvents: collapsed ? 'none': 'auto', transition: 'width 0.2s, opacity 0.2s' }}>
          <div className="logo-icon"><FiTruck /></div>
          <span className="logo-text">FleetPro</span>
        </Link>
        <button className="collapse-btn" style={{ margin: collapsed ? '0 auto' : '0' }} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <FiMenu /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-label">Main Menu</span>}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-text">{item.label}</span>}
              {!collapsed && location.pathname === item.path && (
                <span className="nav-indicator" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{role.replace('ROLE_', '')}</span>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          </div>
        )}
        <button className="nav-item logout-btn" onClick={logout} title="Logout">
          <span className="nav-icon"><FiLogOut /></span>
          {!collapsed && <span className="nav-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
