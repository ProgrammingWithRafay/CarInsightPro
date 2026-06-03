import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Auth.css';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully!');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page-stitch">
      <div className="auth-bg-glow"></div>
      <div className="container px-3 position-relative z-10 py-5">
        <div className="auth-card-stitch fade-in-up text-center">
          
          {status === 'loading' && (
            <>
              <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: '48px', height: '48px' }}>
                  <span className="visually-hidden">Verifying...</span>
                </div>
              </div>
              <h2 className="font-heading mb-2 text-on-surface">Verifying Your Email</h2>
              <p className="text-on-surface-variant">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <div className="auth-header-icon" style={{ width: '80px', height: '80px', margin: '0 auto', background: 'rgba(0, 200, 83, 0.15)', borderColor: '#00C853' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#00C853' }}>verified</span>
                </div>
              </div>
              <h2 className="font-heading mb-3 text-on-surface">Email Verified!</h2>
              <p className="text-on-surface-variant mb-4">{message}</p>
              <Link to="/login" className="btn btn-primary w-100 py-3 fw-bold active-glow text-decoration-none">
                Proceed to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <div className="auth-header-icon" style={{ width: '80px', height: '80px', margin: '0 auto', background: 'rgba(255, 82, 82, 0.15)', borderColor: '#FF5252' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#FF5252' }}>error</span>
                </div>
              </div>
              <h2 className="font-heading mb-3 text-on-surface">Verification Failed</h2>
              <p className="text-on-surface-variant mb-4">{message}</p>
              <div className="d-flex flex-column gap-3">
                <Link to="/register" className="btn btn-outline-primary w-100 py-2 text-decoration-none">
                  Register Again
                </Link>
                <Link to="/login" className="text-primary text-decoration-none small fw-bold">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
