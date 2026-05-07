import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import '../../pages/Landing/Landing.css';

const PublicFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: 16 }}>
              <div className="logo-icon-landing"><FiTruck /></div>
              <span>FleetPro</span>
            </div>
            <p>India's smart fleet management system for logistics, transport, and delivery operations. Built with ❤️ for Indian businesses.</p>
            <div className="footer-socials">
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/routes">Routes</Link>
            <Link to="/how-it-works">How It Works</Link>
            <Link to="/reviews">Reviews</Link>
            <a href="#">Pricing</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Press</a>
            <a href="#">Partners</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <Link to="/contact">Contact Us</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <p><FiPhone style={{ marginRight: 8 }} /> +91 98765 43210</p>
            <p><FiMail style={{ marginRight: 8 }} /> support@fleetpro.com</p>
            <p><FiMapPin style={{ marginRight: 8 }} /> ASM's IBMR, Pune</p>
            <p style={{ marginTop: 8 }}>Maharashtra, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FleetPro by Suyash Tiwari. All rights reserved. | MCA Project</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
