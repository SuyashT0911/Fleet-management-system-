import React, { useState, useEffect } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { FiStar, FiAward, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PublicFooter from '../../components/layout/PublicFooter';

const ReviewsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDashboardLink = () => {
    if (user?.role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (user?.role === 'ROLE_DRIVER') return '/driver/dashboard';
    return '/customer/dashboard';
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/feedback/public/testimonials');
        setReviews(res.data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="landing">
      <PublicNavbar />
      <div className="trips-content" style={{ padding: '100px 0', minHeight: '80vh' }}>
        <div className="landing-container">
          <div className="trips-header" style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-badge" style={{ margin: '0 auto 16px' }}>Verified Reviews</span>
            <h1>Trusted by Industry Leaders</h1>
            <p style={{ maxWidth: 700, margin: '0 auto', fontSize: 18 }}>
              Real feedback from real businesses. See how FleetPro is helping our partners optimize their logistics and scale operations across India.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32 }}>
              {reviews.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0', background: '#f8fafc', borderRadius: 24 }}>
                  <p style={{ color: 'var(--text-muted)' }}>No public reviews available at the moment.</p>
                </div>
              )}
              {reviews.map((fb, i) => (
                <div key={fb.feedbackId || i} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[...Array(5)].map((_, j) => (
                        <FiStar key={j} style={{ fill: j < fb.rating ? '#f59e0b' : 'none', color: j < fb.rating ? '#f59e0b' : '#e2e8f0', fontSize: 18 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-primary)', fontSize: 16, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24, flex: 1 }}>
                    "{fb.comments}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: fb.adminReply ? 24 : 0, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: '50%', 
                      background: 'var(--primary-light)', color: 'var(--primary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 
                    }}>
                      {(fb.user?.name || fb.customer?.name || 'C')[0]}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{fb.user?.name || fb.customer?.name || 'Verified Customer'}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                        <FiCheckCircle size={12} /> Verified Partner
                      </div>
                    </div>
                  </div>

                  {fb.adminReply && (
                    <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(99,102,241,0.05)', position: 'relative', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
                        <FiAward style={{ color: 'var(--primary)' }} />
                        <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>Official Response</strong>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        {fb.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: '80px', padding: '60px', background: '#f8fafc', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Share Your Experience</h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Are you an existing customer? We'd love to hear how FleetPro is helping your business grow.</p>
            {!isAuthenticated ? (
              <a href="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', padding: '12px 28px' }}>Log in to Write a Review</a>
            ) : (
              <a href={getDashboardLink()} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', padding: '12px 28px' }}>Go to Dashboard</a>
            )}
          </div>

        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default ReviewsPage;
