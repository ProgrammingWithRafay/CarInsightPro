import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-stitch mt-auto w-full py-5">
      <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          
          <div className="d-flex flex-column gap-2 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <img src="/logo.png" alt="CarInsight Pro Logo" style={{ height: '30px', width: 'auto', borderRadius: '4px' }} />
              <span className="footer-brand">CarInsight Pro</span>
            </div>
            <span className="footer-text">© {new Date().getFullYear()} CarInsight Pro. Your car research companion.</span>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-4">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/cars" className="footer-link">Browse Vehicles</Link>
            <Link to="/contact" className="footer-link">Contact Support</Link>
          </div>

          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
