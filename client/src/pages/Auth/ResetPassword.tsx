import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import './Auth.css';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword(token!, password);
      setSuccess(true);
      showToast(res.message || 'Password reset successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to reset password. The link may be expired.', 'error');
    } finally {
      setLoading(false);
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
                <span className="material-symbols-outlined text-primary fs-3">directions_car</span>
              </div>
            </Link>
            <h2 className="font-heading mb-1 text-on-surface">
              {success ? 'Key Reset Complete' : 'Set New Access Key'}
            </h2>
            <p className="text-on-surface-variant small">
              {success ? 'Your password has been updated.' : 'Choose a strong new password.'}
            </p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-success mb-3" style={{ fontSize: '48px' }}>check_circle</span>
              <h5 className="font-heading text-on-surface mb-2">Password Updated</h5>
              <p className="text-on-surface-variant small mb-4">
                Your access key has been reset successfully. You can now log in with your new credentials.
              </p>
              <button
                className="btn btn-primary w-100 py-3 fw-bold active-glow"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label font-mono text-uppercase fw-bold" style={{ fontSize: '10px' }}>New Access Key</label>
                <div className="auth-input-group">
                  <span className="material-symbols-outlined auth-input-icon fs-5">lock</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="form-label font-mono text-uppercase fw-bold" style={{ fontSize: '10px' }}>Confirm Access Key</label>
                <div className="auth-input-group">
                  <span className="material-symbols-outlined auth-input-icon fs-5">lock</span>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold active-glow" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : 'Reset Access Key'}
              </button>

              <div className="text-center mt-3">
                <Link to="/login" className="btn btn-link text-on-surface-variant text-decoration-none small p-0">
                  <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
