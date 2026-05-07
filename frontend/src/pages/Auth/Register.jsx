import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/authService';
import { FiTruck, FiUser, FiMail, FiLock } from 'react-icons/fi';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // All new users register as ROLE_CUSTOMER by default
      // Admin can later assign a different role from the dashboard
      const res = await registerApi({ name, email, password, role: 'ROLE_CUSTOMER' });
      login(res.data);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">
          <div className="logo-icon"><FiTruck /></div>
          <h2>FleetPro</h2>
        </div>
        <h1>Create Account</h1>
        <p className="subtitle">Get started with FleetPro</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="text" className="form-control" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: 45 }} required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="email" className="form-control" placeholder="john@fleetpro.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 45 }} required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="password" className="form-control" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 45 }} required minLength={6}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-link" style={{ marginTop: 8 }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
