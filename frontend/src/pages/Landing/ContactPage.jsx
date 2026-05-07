import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';

import PublicFooter from '../../components/layout/PublicFooter';

const ContactPage = () => {
  return (
    <div className="available-trips-page">
      <PublicNavbar />
      <div className="trips-content" style={{ padding: '60px 0' }}>
        <div className="landing-container">
          <div className="trips-header" style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-badge" style={{ margin: '0 auto 16px' }}>Contact Us</span>
            <h1>Get in Touch with Our Team</h1>
            <p style={{ maxWidth: 700, margin: '0 auto', fontSize: 18 }}>
              Have questions about pricing, features, or how FleetPro can scale with your business? Our team is here to help.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {/* Contact Details */}
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Let's Talk Business.</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>
                Whether you are a small startup with 5 vehicles or an enterprise with a fleet of 500+, 
                FleetPro can be tailored to meet your specific operational needs. Reach out to our 
                sales and support teams below.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiPhone />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Call Us</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Mon-Fri from 9am to 6pm IST</p>
                    <a href="tel:+919876543210" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>+91 98765 43210</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiMail />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Email Us</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>We usually respond within 24 hours.</p>
                    <a href="mailto:support@fleetpro.com" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>support@fleetpro.com</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiMapPin />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Visit Our Office</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      ASM's IBMR<br />
                      Chinchwad, Pune<br />
                      Maharashtra 411019, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Send us a Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent. Our team will contact you shortly.'); e.target.reset(); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>First Name</label>
                    <input type="text" className="form-control" placeholder="John" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Last Name</label>
                    <input type="text" className="form-control" placeholder="Doe" required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Email Address</label>
                  <input type="email" className="form-control" placeholder="john@company.com" required />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Company Name</label>
                  <input type="text" className="form-control" placeholder="Optional" />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label>Message</label>
                  <textarea className="form-control" rows={5} placeholder="How can we help you?" required style={{ resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  <FiSend /> Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default ContactPage;
