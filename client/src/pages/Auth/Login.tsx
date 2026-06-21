import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import axios from 'axios';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      showToast('Authentication successful.', 'success');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data?.message || 'Authentication failed. Verify credentials.', 'error');
      } else {
        showToast('Authentication failed. Verify credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      await authService.forgotPassword(forgotEmail);
      setForgotSent(true);
      showToast('Password reset link sent! Check your email.', 'success');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data?.message || 'Failed to send reset email.', 'error');
      } else {
        showToast('Failed to send reset email.', 'error');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page-stitch">
      <div className="auth-bg-glow"></div>

      <div className="container px-3 position-relative z-10">
        <div className="auth-card-stitch fade-in-up">
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none d-inline-block">
              <div className="auth-header-icon">
                <span className="material-symbols-outlined icon-xl text-primary" aria-hidden="true">directions_car</span>
              </div>
            </Link>
            <h2 className="font-heading mb-1 text-on-surface">
              {showForgot ? 'Reset Access Key' : 'Secure Access'}
            </h2>
            <p className="text-on-surface-variant small">
              {showForgot ? 'Enter your email to receive a reset link.' : 'Authenticate to access telemetry.'}
            </p>
          </div>

          {showForgot ? (
            // Forgot password form
            forgotSent ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined icon-xxl text-success mb-3" aria-hidden="true">mark_email_read</span>
                <h5 className="font-heading text-on-surface mb-2">Reset Link Sent</h5>
                <p className="text-on-surface-variant small mb-4">
                  If an account exists for <strong className="text-primary">{forgotEmail}</strong>, we've sent a password reset link. It will expire in 1 hour.
                </p>
                <button
                  className="btn btn-outline-primary w-100 py-2"
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label font-mono text-uppercase fw-bold label-xs">Email Address</label>
                  <div className="auth-input-group">
                    <span className="material-symbols-outlined auth-input-icon icon-md" aria-hidden="true">mail</span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="ali.raza@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold active-glow" disabled={forgotLoading}>
                  {forgotLoading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : 'Send Reset Link'}
                </button>

                <div className="text-center mt-3">
                  <button type="button" className="btn btn-link text-on-surface-variant text-decoration-none small p-0" onClick={() => setShowForgot(false)}>
                    <span className="material-symbols-outlined icon-sm icon-inline me-1" aria-hidden="true">arrow_back</span>
                    Back to Login
                  </button>
                </div>
              </form>
            )
          ) : (
            // Normal login form
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label font-mono text-uppercase fw-bold label-xs">Email Address</label>
                <div className="auth-input-group">
                  <span className="material-symbols-outlined auth-input-icon icon-md" aria-hidden="true">mail</span>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="ali.raza@domain.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label font-mono text-uppercase fw-bold m-0 label-xs">Access Key</label>
                  <button
                    type="button"
                    className="btn btn-link text-primary text-decoration-none font-mono p-0 border-0 label-xs"
                    onClick={() => setShowForgot(true)}
                  >
                    Reset Key?
                  </button>
                </div>
                <div className="auth-input-group mt-1">
                  <span className="material-symbols-outlined auth-input-icon icon-md" aria-hidden="true">lock</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold active-glow" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : 'Authenticate'}
              </button>

              <div className="text-center mt-4">
                <p className="text-on-surface-variant font-body small m-0">
                  Unregistered operator? <Link to="/register" className="text-primary text-decoration-none ms-1 fw-bold">Request Access</Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
