import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { supportService } from '../../services/supportService';
import './StaticPages.css';

const Contact: React.FC = () => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        subject: formData.subject,
        message: formData.message
      };

      if (!isAuthenticated) {
        payload.name = formData.name;
        payload.email = formData.email;
      }

      const res = await supportService.createMessage(payload);
      if (res.success) {
        showToast('Your message has been sent! We\'ll get back to you within 24 hours.', 'success');
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        showToast(res.message || 'Failed to send message.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'An error occurred while sending your message.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      <div className="static-page-header mb-5">
        <h1 className="font-heading display-5 fw-bold">Contact Support</h1>
        <p className="text-on-surface-variant">Have a question or need help? We're here for you.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="glass-panel p-4 p-md-5 rounded-4">
            <h3 className="font-heading h4 text-primary mb-4">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {!isAuthenticated && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label font-mono small text-uppercase text-on-surface-variant">Full Name</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label font-mono small text-uppercase text-on-surface-variant">Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
              )}
              <div>
                <label className="form-label font-mono small text-uppercase text-on-surface-variant">Subject</label>
                <select className="form-select" name="subject" value={formData.subject} onChange={handleChange}>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Consultation">Book a Consultation</option>
                </select>
              </div>
              <div>
                <label className="form-label font-mono small text-uppercase text-on-surface-variant">Message</label>
                <textarea className="form-control" name="message" rows={5} value={formData.message} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary py-3 fw-bold mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> Sending...</>
                ) : (
                  <><span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>send</span> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="d-flex flex-column gap-4">
            <div className="glass-panel p-4 rounded-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="contact-icon-wrapper bg-primary bg-opacity-10">
                  <span className="material-symbols-outlined text-primary">mail</span>
                </div>
                <div>
                  <div className="font-mono small text-uppercase text-on-surface-variant">Email</div>
                  <div className="text-on-surface fw-bold">support@carinsightpro.com</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="contact-icon-wrapper bg-primary bg-opacity-10">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                </div>
                <div>
                  <div className="font-mono small text-uppercase text-on-surface-variant">Response Time</div>
                  <div className="text-on-surface fw-bold">Within 24 hours</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="contact-icon-wrapper bg-primary bg-opacity-10">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                </div>
                <div>
                  <div className="font-mono small text-uppercase text-on-surface-variant">Live Support</div>
                  <div className="text-on-surface fw-bold">Mon - Fri, 9AM - 6PM EST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
