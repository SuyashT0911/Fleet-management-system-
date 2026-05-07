import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/authService';
import { FiTruck, FiMail, FiLock } from 'react-icons/fi';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleRedirect = (role) => {
    if (role === 'ROLE_DRIVER') return '/driver/dashboard';
    if (role === 'ROLE_CUSTOMER') return '/customer/dashboard';
    return '/admin/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data);
      navigate(roleRedirect(res.data.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to manage your fleet</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input type="email" className="form-control" placeholder="admin@fleetpro.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 45 }} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: 45 }} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>



        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-link" style={{ marginTop: 8 }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
