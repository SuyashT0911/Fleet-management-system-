import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import { FiTruck, FiMap, FiShield, FiBarChart2, FiUsers, FiClock, FiSettings, FiSmartphone, FiBell } from 'react-icons/fi';

const FeaturesPage = () => {
  const extendedFeatures = [
    { icon: <FiTruck />, title: 'Real-Time Fleet Tracking', desc: 'Monitor your entire fleet live on a single map. Get instant updates on vehicle location, speed, and heading to ensure optimal routing and adherence to schedules.', color: '#6366f1' },
    { icon: <FiMap />, title: 'Intelligent Route Optimization', desc: 'Our AI-powered routing engine calculates the fastest, most fuel-efficient paths, taking into account live traffic, weather conditions, and vehicle capacity.', color: '#06b6d4' },
    { icon: <FiShield />, title: 'Advanced Safety & Compliance', desc: 'Keep your drivers safe with behavior monitoring (harsh braking, speeding). Maintain digital logs for compliance, incident reporting, and easy audit trails.', color: '#10b981' },
    { icon: <FiBarChart2 />, title: 'Comprehensive Analytics', desc: 'Dive deep into performance metrics. Generate custom reports on fuel usage, idle time, driver efficiency, and overall fleet ROI to make data-driven decisions.', color: '#f59e0b' },
    { icon: <FiUsers />, title: 'Driver Management', desc: 'Assign trips, track driver work hours, manage shifts, and monitor performance. Communicate directly via the app to reduce dispatch overhead.', color: '#ec4899' },
    { icon: <FiClock />, title: 'Automated Dispatching', desc: 'Eliminate manual scheduling. Our system automatically matches the nearest available and suitable vehicle to new trip requests in seconds.', color: '#8b5cf6' },
    { icon: <FiSettings />, title: 'Predictive Maintenance', desc: 'Never miss a service date. Get automated alerts for engine diagnostics, tire rotations, and oil changes based on actual vehicle mileage.', color: '#3b82f6' },
    { icon: <FiSmartphone />, title: 'Dedicated Driver App', desc: 'Drivers get a mobile-first experience to accept trips, navigate routes, capture proof of delivery, and report expenses on the go.', color: '#14b8a6' },
    { icon: <FiBell />, title: 'Custom Alerts & Geofencing', desc: 'Draw virtual boundaries on the map. Get instant SMS or push notifications when vehicles enter or exit designated zones.', color: '#f43f5e' },
  ];

  return (
    <div className="available-trips-page">
      <PublicNavbar />
      <div className="trips-content" style={{ padding: '60px 0' }}>
        <div className="landing-container">
          <div className="trips-header" style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-badge" style={{ margin: '0 auto 16px' }}>Features</span>
            <h1>Everything You Need to Run Your Fleet</h1>
            <p style={{ maxWidth: 700, margin: '0 auto', fontSize: 18 }}>
              FleetPro is built from the ground up to solve the most complex challenges in logistics and transport. Explore our comprehensive suite of tools.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {extendedFeatures.map((f, i) => (
              <div key={i} className="card" style={{ padding: 32, transition: 'transform 0.3s', cursor: 'default' }} 
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ 
                  width: 60, height: 60, borderRadius: 16, 
                  background: `${f.color}15`, color: f.color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 28, marginBottom: 24 
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '80px', padding: '60px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px', color: 'white' }}>Ready to optimize your fleet operations?</h2>
            <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>Get started today and see a 30% reduction in operating costs within the first month.</p>
            <a href="/register" className="btn btn-white btn-lg" style={{ display: 'inline-flex', padding: '14px 32px' }}>Start Free Trial</a>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default FeaturesPage;
