import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck, FiMap, FiShield, FiBarChart2, FiUsers, FiClock,
  FiArrowRight, FiCheck, FiPhone, FiMail, FiMapPin, FiStar,
  FiZap, FiAward, FiTarget, FiGlobe, FiLayers, FiCheckCircle,
  FiChevronRight, FiPlay, FiPackage, FiNavigation, FiTrendingUp, FiHeart,
  FiActivity, FiSmartphone, FiCpu, FiPieChart
} from 'react-icons/fi';
import './Landing.css';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const capabilities = [
  { icon: <FiCpu />, title: 'AI-Powered Dispatching', desc: 'Our machine learning models automatically assign the most efficient vehicles and routes based on traffic, load capacity, and driver hours.', color: '#6366f1' },
  { icon: <FiActivity />, title: 'Live Telemetry & Tracking', desc: 'Get real-time updates on vehicle speed, fuel consumption, engine health, and driver behavior straight to your dashboard.', color: '#06b6d4' },
  { icon: <FiShield />, title: 'End-to-End Security', desc: 'Military-grade encryption protects your business data. Role-based access ensures your team only sees what they need to see.', color: '#10b981' },
  { icon: <FiPieChart />, title: 'Advanced Financial Analytics', desc: 'Track revenue per mile, fuel costs per trip, and maintenance ROI in real-time with customizable dashboards and exports.', color: '#f59e0b' },
  { icon: <FiUsers />, title: 'Comprehensive Driver CRM', desc: 'Manage driver schedules, compliance documents, performance ratings, and direct communications all in one centralized hub.', color: '#ec4899' },
  { icon: <FiSmartphone />, title: 'Mobile-First Architecture', desc: 'Drivers can update trip statuses, log fuel entries, report incidents, and receive new assignments — all from a responsive interface that works seamlessly on any device.', color: '#8b5cf6' },
];

const formatNum = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.querySelector('.landing');
      setScrolled(el && el.scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);

  // Fetch real-time platform stats from DB
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/public-stats');
        setPlatformStats(res.data);
      } catch (err) {
        console.error('Failed to load platform stats', err);
      }
    };
    fetchStats();
  }, []);

  const liveStats = platformStats ? [
    { value: formatNum(platformStats.totalTrips), label: 'Total Trips', icon: <FiNavigation /> },
    { value: formatNum(platformStats.totalVehicles), label: 'Vehicles Managed', icon: <FiTruck /> },
    { value: formatNum(platformStats.activeDrivers), label: 'Active Drivers', icon: <FiUsers /> },
    { value: '₹' + formatNum(parseFloat(platformStats.totalRevenue || 0)), label: 'Total Revenue', icon: <FiTrendingUp /> },
  ] : [
    { value: '—', label: 'Total Trips', icon: <FiNavigation /> },
    { value: '—', label: 'Vehicles Managed', icon: <FiTruck /> },
    { value: '—', label: 'Active Drivers', icon: <FiUsers /> },
    { value: '—', label: 'Total Revenue', icon: <FiTrendingUp /> },
  ];

  const getDashboardLink = () => {
    if (user?.role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (user?.role === 'ROLE_DRIVER') return '/driver/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="landing">
      <PublicNavbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="landing-container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <FiZap style={{ color: '#f59e0b' }} />
              <span>India's #1 Smart Fleet Solution</span>
            </div>
            <h1>
              Command Your Fleet<br />
              <span className="hero-gradient">Smarter, Faster</span> &<br />
              <span className="hero-gradient-alt">More Profitably</span>
            </h1>
            <p>
              FleetPro represents the next generation of logistics intelligence. We empower Indian transport businesses to automate dispatch, reduce fuel expenditure by up to 30%, and monitor thousands of vehicles in absolute real-time.
            </p>
            <div className="hero-actions">
              {!isAuthenticated ? (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Free Trial <FiArrowRight />
                </Link>
              ) : (
                <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                  Go to Dashboard <FiArrowRight />
                </Link>
              )}
              <Link to="/available-trips" className="btn btn-outline btn-lg">
                <FiPlay /> View Live Routes
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <div className="trust-avatar" style={{ background: '#6366f1' }}>R</div>
                <div className="trust-avatar" style={{ background: '#06b6d4' }}>A</div>
                <div className="trust-avatar" style={{ background: '#10b981' }}>V</div>
                <div className="trust-avatar" style={{ background: '#f59e0b' }}>P</div>
              </div>
              <div className="trust-text">
                <div className="trust-stars">
                  {[...Array(5)].map((_, i) => <FiStar key={i} style={{ fill: '#f59e0b', color: '#f59e0b', fontSize: 14 }} />)}
                </div>
                <span>Trusted by {platformStats ? platformStats.totalCustomers : '—'} Registered Customers & Growing</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-dashboard-card" style={{ transform: 'scale(1.05)' }}>
              <div className="dash-header">
                <div className="dash-dot red"></div>
                <div className="dash-dot yellow"></div>
                <div className="dash-dot green"></div>
                <span>FleetPro Live Operations</span>
              </div>
              <div className="dash-body">
                <div className="dash-stat-row">
                  {liveStats.map((s, i) => (
                    <div key={i} className="dash-mini-stat">
                      <span className="dash-mini-icon">{s.icon}</span>
                      <span className="dash-mini-val">{s.value}</span>
                      <span className="dash-mini-label">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dash-chart-placeholder">
                  <div className="dash-bar" style={{ height: '40%' }}></div>
                  <div className="dash-bar" style={{ height: '65%' }}></div>
                  <div className="dash-bar" style={{ height: '50%' }}></div>
                  <div className="dash-bar" style={{ height: '80%' }}></div>
                  <div className="dash-bar" style={{ height: '70%' }}></div>
                  <div className="dash-bar" style={{ height: '90%' }}></div>
                  <div className="dash-bar" style={{ height: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Value Proposition Section */}
      <section className="features-section" style={{ background: '#f8fafc', padding: '100px 0' }}>
        <div className="landing-container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-badge">Platform Capabilities</span>
            <h2>An Entire Operating System For Your Fleet</h2>
            <p>We've replaced scattered spreadsheets, WhatsApp groups, and generic trackers with a unified, enterprise-grade architecture.</p>
          </div>
          <div className="features-grid">
            {capabilities.map((cap, i) => (
              <div key={i} className="feature-card" style={{ padding: '40px', borderRadius: '24px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div className="feature-icon" style={{ background: `${cap.color}15`, color: cap.color, width: '64px', height: '64px', fontSize: '28px', marginBottom: '24px' }}>
                  {cap.icon}
                </div>
                <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>{cap.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '16px' }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workflow Highlight */}
      <section style={{ padding: '100px 0', background: '#ffffff' }}>
        <div className="landing-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 500px' }}>
              <span className="section-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>Unified Command Center</span>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-primary)' }}>Total fleet visibility from a single dashboard.</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '32px' }}>
                Whether your fleet manager is in the office or on-the-go, FleetPro gives complete operational control. Track every vehicle's location, monitor driver performance, schedule preventive maintenance, and analyze fuel consumption — all synchronized in real-time across admin, driver, and customer interfaces.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><FiCheck /></div>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Live GPS Tracking & Route Optimization</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><FiCheck /></div>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Automated Maintenance & Inspection Alerts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><FiCheck /></div>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Driver Scheduling & Performance Analytics</span>
                </div>
              </div>
            </div>
            <div style={{ flex: '1 1 500px', position: 'relative' }}>
              <div style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', padding: '40px', borderRadius: '32px', position: 'relative' }}>
                <img src="/fleet-command-center.png" alt="Fleet Command Center Dashboard" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    <FiTruck />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '18px' }}>{platformStats ? platformStats.totalVehicles : '—'} Vehicles Active</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>All systems operational</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#fff', padding: '16px 20px', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>Live Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      {/* CTA */}
      <section className="cta-section" style={{ margin: '60px 0' }}>
        <div className="landing-container cta-content">
          <h2>Ready to Transform Your Fleet Operations?</h2>
          <p>Join 100+ businesses already using FleetPro to optimize their fleet operations, reduce costs, and maximize vehicle uptime.</p>
          <div className="cta-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-white btn-lg">
                  Start Free Trial <FiArrowRight />
                </Link>
                <Link to="/login" className="btn btn-outline-white btn-lg">
                  Sign In to Dashboard
                </Link>
              </>
            ) : (
              <Link to={getDashboardLink()} className="btn btn-white btn-lg">
                Go to Dashboard <FiArrowRight />
              </Link>
            )}
          </div>
          <div className="cta-features">
            <span><FiCheckCircle /> Enterprise Grade</span>
            <span><FiCheckCircle /> 24/7 Dedicated Support</span>
            <span><FiCheckCircle /> ISO Certified Security</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/feedback/public/testimonials');
        setTestimonials(res.data);
      } catch (err) { console.error('Failed to load testimonials', err); }
    };
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section style={{ padding: '100px 0', background: '#f8fafc' }}>
      <div className="landing-container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-badge">Customer Success</span>
          <h2>Trusted by Industry Leaders</h2>
          <p>Don't just take our word for it — see what our active partners have to say about their FleetPro experience.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {testimonials.slice(0, 3).map((t, i) => (
            <div key={i} className="card" style={{ padding: '32px', borderRadius: '24px', background: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => <FiStar key={i} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
              </div>
              <p style={{ fontSize: '17px', lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '24px', fontStyle: 'italic' }}>
                "{t.comments}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: t.adminReply ? '24px' : '0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px' }}>
                  {(t.user?.name || t.customer?.name || 'C')[0]}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{t.user?.name || t.customer?.name || 'Customer'}</h4>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Verified Partner</span>
                </div>
              </div>
              {t.adminReply && (
                <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--primary-light)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', width: '20px', height: '20px', background: 'var(--primary-light)', transform: 'rotate(45deg)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiAward style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>Admin Response</strong>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {t.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Landing;
