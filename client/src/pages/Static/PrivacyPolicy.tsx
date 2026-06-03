import React from 'react';
import './StaticPages.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      <div className="static-page-header mb-5">
        <h1 className="font-heading display-5 fw-bold">Privacy Policy</h1>
        <p className="text-on-surface-variant">Last updated: May 2026</p>
      </div>

      <div className="glass-panel p-4 p-md-5 rounded-4">
        <div className="static-content">
          <h2 className="font-heading h4 text-primary mb-3">1. Information We Collect</h2>
          <p className="text-on-surface-variant mb-4">
            CarInsight Pro collects personal information you provide directly, including your name, email address, and account credentials when you register. We also collect usage data such as vehicle searches, comparisons, and bookmarks to improve our analytics and personalize your experience.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">2. How We Use Your Information</h2>
          <p className="text-on-surface-variant mb-4">
            Your data is used to provide and improve our automotive analytics services, generate personalized vehicle recommendations, process your account requests, and send you relevant notifications about market trends and saved vehicles.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">3. Data Security</h2>
          <p className="text-on-surface-variant mb-4">
            We implement industry-standard encryption (AES-256) and secure protocols (TLS 1.3) to protect your personal data. Passwords are hashed using bcrypt and are never stored in plaintext. Our infrastructure undergoes regular security audits.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">4. Cookies & Tracking</h2>
          <p className="text-on-surface-variant mb-4">
            We use essential cookies for authentication and session management. Analytics cookies help us understand usage patterns. You can manage cookie preferences through your browser settings at any time.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">5. Third-Party Services</h2>
          <p className="text-on-surface-variant mb-4">
            We integrate with trusted third-party services including Cloudinary for image hosting and MongoDB Atlas for data storage. These partners adhere to strict data protection standards and are bound by data processing agreements.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">6. Your Rights</h2>
          <p className="text-on-surface-variant mb-4">
            You have the right to access, correct, or delete your personal data at any time. You may also request a portable copy of your data or opt out of non-essential communications by contacting our support team.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">7. Contact Us</h2>
          <p className="text-on-surface-variant">
            For privacy-related inquiries, please reach out to our Data Protection Officer at <strong className="text-primary">carinsight.app@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
