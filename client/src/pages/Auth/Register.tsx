import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resending, setResending] = useState(false);
  
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return showToast('Access keys do not match.', 'error');
    }
    
    setLoading(true);
    
    try {
      await register(formData);
      setEmailSent(true);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(formData.email);
      showToast('Verification email resent! Check your inbox.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to resend email.', 'error');
    } finally {
      setResending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page-stitch">
        <div className="auth-bg-glow"></div>
        <div className="container px-3 position-relative z-10 py-5">
          <div className="auth-card-stitch fade-in-up text-center">
            <div className="mb-4">
              <div className="auth-header-icon" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>mark_email_read</span>
              </div>
            </div>
            <h2 className="font-heading mb-3 text-on-surface">Check Your Email</h2>
            <p className="text-on-surface-variant mb-4" style={{ lineHeight: '1.7' }}>
              We've sent a verification link to<br/>
              <strong className="text-primary">{formData.email}</strong>
            </p>
            <p className="text-on-surface-variant small mb-4">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>
            
            <div className="d-flex flex-column gap-3 mt-4">
              <button 
                className="btn btn-outline-primary w-100 py-2" 
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined align-middle me-2" style={{ fontSize: '18px' }}>refresh</span>
                    Resend Verification Email
                  </>
                )}
              </button>
              <Link to="/login" className="text-primary text-decoration-none small fw-bold">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-stitch">
      <div className="auth-bg-glow"></div>
      
      <div className="container px-3 position-relative z-10 py-5">
        <div className="auth-card-stitch fade-in-up">
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none d-inline-block">
              <div className="auth-header-icon">
                <span className="material-symbols-outlined text-primary fs-3">app_registration</span>
              </div>
            </Link>
            <h2 className="font-heading mb-1 text-on-surface">Operator Registration</h2>
            <p className="text-on-surface-variant small">Initialize access to analytics database.</p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            
            <div>
              <label className="form-label font-mono text-uppercase fw-bold" style={{ fontSize: '10px' }}>Full Designation</label>
              <div className="auth-input-group">
                <span className="material-symbols-outlined auth-input-icon fs-5">badge</span>
                <input 
                  type="text" 
                  name="name"
                  className="auth-input" 
                  placeholder="Alexander Sterling"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="form-label font-mono text-uppercase fw-bold" style={{ fontSize: '10px' }}>Email Address</label>
              <div className="auth-input-group">
                <span className="material-symbols-outlined auth-input-icon fs-5">mail</span>
                <input 
                  type="email" 
                  name="email"
                  className="auth-input" 
                  placeholder="operator@system.com"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="form-label font-mono text-uppercase fw-bold m-0" style={{ fontSize: '10px' }}>Access Key</label>
              <div className="auth-input-group mt-1">
                <span className="material-symbols-outlined auth-input-icon fs-5">lock</span>
                <input 
                  type="password" 
                  name="password"
                  className="auth-input" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="form-label font-mono text-uppercase fw-bold m-0" style={{ fontSize: '10px' }}>Verify Access Key</label>
              <div className="auth-input-group mt-1">
                <span className="material-symbols-outlined auth-input-icon fs-5">lock_clock</span>
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="auth-input" 
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold active-glow" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : 'Initialize Access'}
            </button>

            <div className="text-center mt-4">
              <p className="text-on-surface-variant font-body small m-0">
                Already registered? <Link to="/login" className="text-primary text-decoration-none ms-1 fw-bold">Authenticate</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
