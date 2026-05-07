import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { FiUserPlus, FiTarget, FiActivity, FiCheckCircle } from 'react-icons/fi';

import PublicFooter from '../../components/layout/PublicFooter';

const HowItWorksPage = () => {
  return (
    <div className="available-trips-page">
      <PublicNavbar />
      <div className="trips-content" style={{ padding: '60px 0' }}>
        <div className="landing-container">
          <div className="trips-header" style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-badge" style={{ margin: '0 auto 16px' }}>How It Works</span>
            <h1>From Registration to Delivery</h1>
            <p style={{ maxWidth: 700, margin: '0 auto', fontSize: 18 }}>
              FleetPro streamlines the entire logistics process. Here is how our platform connects Customers, Drivers, and Fleet Admins in perfect sync.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 900, margin: '0 auto' }}>
            {/* Step 1 */}
            <div className="card" style={{ display: 'flex', gap: 32, padding: 40, alignItems: 'center' }}>
              <div style={{ 
                flexShrink: 0, width: 100, height: 100, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 
              }}>
                <FiUserPlus />
              </div>
              <div>
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>1. Sign Up & Role Assignment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  Users register on the platform. By default, everyone is assigned the Customer role, allowing them to browse and book trips immediately. 
                  Fleet administrators can subsequently elevate users to Driver or Admin roles through the secure backend dashboard.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Instant Customer Access</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Secure Admin Verification</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ display: 'flex', gap: 32, padding: 40, alignItems: 'center', flexDirection: 'row-reverse' }}>
              <div style={{ 
                flexShrink: 0, width: 100, height: 100, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 
              }}>
                <FiTarget />
              </div>
              <div>
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>2. Booking & Dispatching</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  Customers can browse available trips or request custom routes. Once booked, the trip goes into the Fleet Admin queue. 
                  The Admin matches the optimal vehicle and assigns a Driver. The Driver receives an instant notification to accept the assignment.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Automated Matching</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Driver Mobile Alerts</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ display: 'flex', gap: 32, padding: 40, alignItems: 'center' }}>
              <div style={{ 
                flexShrink: 0, width: 100, height: 100, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 
              }}>
                <FiActivity />
              </div>
              <div>
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>3. Live Tracking & Delivery</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  During transit, the system tracks the vehicle's GPS location. Customers can view the live ETA of their shipment. 
                  Drivers can report incidents directly from the road. Upon arrival, the trip is marked complete, billing is finalized, and analytics are updated.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Real-time ETA</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Digital Proof of Delivery</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ display: 'flex', gap: 32, padding: 40, alignItems: 'center', flexDirection: 'row-reverse' }}>
              <div style={{ 
                flexShrink: 0, width: 100, height: 100, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #ec4899, #f43f5e)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 
              }}>
                <FiCheckCircle />
              </div>
              <div>
                <h3 style={{ fontSize: 24, marginBottom: 12 }}>4. Analytics & Billing</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  Once the delivery is complete, automated invoices are generated for the customer. The administration dashboard immediately incorporates the trip data into overall fleet analytics, helping measure fuel efficiency, driver performance, and overall ROI.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Automated Invoicing</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}><FiCheckCircle style={{color:'#10b981'}}/> Instant Reports</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default HowItWorksPage;
