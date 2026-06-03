import React from 'react';
import './StaticPages.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      <div className="static-page-header mb-5">
        <h1 className="font-heading display-5 fw-bold">Terms of Service</h1>
        <p className="text-on-surface-variant">Last updated: May 2026</p>
      </div>

      <div className="glass-panel p-4 p-md-5 rounded-4">
        <div className="static-content">
          <h2 className="font-heading h4 text-primary mb-3">1. Acceptance of Terms</h2>
          <p className="text-on-surface-variant mb-4">
            By accessing or using CarInsight Pro, you agree to be bound by these Terms of Service. If you do not agree, you may not use our platform. We reserve the right to modify these terms at any time with reasonable notice.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">2. Account Responsibilities</h2>
          <p className="text-on-surface-variant mb-4">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use. CarInsight Pro is not liable for losses resulting from unauthorized account access due to user negligence.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">3. Permitted Use</h2>
          <p className="text-on-surface-variant mb-4">
            Our platform is intended for personal and professional automotive research purposes. You may not use automated tools to scrape data, redistribute our analytics without permission, or use the platform for any unlawful activities.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">4. Content & Reviews</h2>
          <p className="text-on-surface-variant mb-4">
            By submitting reviews or content, you grant CarInsight Pro a non-exclusive license to display and distribute your contributions. You warrant that your content is truthful, does not infringe on third-party rights, and complies with community guidelines.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">5. Data Accuracy</h2>
          <p className="text-on-surface-variant mb-4">
            While we strive for accuracy, vehicle specifications, pricing, and market projections are provided for informational purposes only. CarInsight Pro does not guarantee the completeness or accuracy of any data and is not liable for decisions made based on our analytics.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">6. Limitation of Liability</h2>
          <p className="text-on-surface-variant mb-4">
            CarInsight Pro shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
          </p>

          <h2 className="font-heading h4 text-primary mb-3">7. Governing Law</h2>
          <p className="text-on-surface-variant">
            These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration in accordance with industry standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
