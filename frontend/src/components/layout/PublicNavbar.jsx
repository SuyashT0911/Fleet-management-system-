import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTruck, FiArrowRight, FiUser, FiGrid, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './PublicNavbar.css';

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50 || document.querySelector('.landing')?.scrollTop > 50 || document.documentElement.scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll, true);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (user.role === 'ROLE_DRIVER') return '/driver/dashboard';
    return '/customer/dashboard';
  };

  const getProfileLink = () => {
    if (!user) return '/login';
    if (user.role === 'ROLE_ADMIN') return '/admin/users'; // Admin might not have profile, link to users or dash
    if (user.role === 'ROLE_DRIVER') return '/driver/profile';
    return '/customer/profile';
  };

  return (
    <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="landing-container nav-content">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon-landing"><FiTruck /></div>
          <span>FleetPro</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/routes">Routes</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/contact">Contact</Link>
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary nav-btn">Sign In</Link>
              <Link to="/register" className="btn btn-primary nav-btn" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white' }}>Get Started <FiArrowRight /></Link>
            </>
          ) : (
            <div className="nav-user-dropdown" ref={dropdownRef}>
              <div 
                className="nav-avatar-btn" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="nav-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
                <FiChevronDown />
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to={getProfileLink()} className="dropdown-item">
                    <FiUser /> My Profile
                  </Link>
                  <Link to={getDashboardLink()} className="dropdown-item">
                    <FiGrid /> Dashboard
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
