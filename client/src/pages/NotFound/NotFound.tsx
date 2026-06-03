import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center px-3" style={{ minHeight: '70vh' }}>
      <div className="mb-4">
        <span className="material-symbols-outlined" style={{ fontSize: '80px', color: 'var(--primary)', opacity: 0.6 }}>
          explore_off
        </span>
      </div>
      <h1 className="font-heading display-4 fw-bold mb-2" style={{ color: 'var(--primary)' }}>404</h1>
      <h2 className="font-heading h4 text-on-surface mb-3">Page Not Found</h2>
      <p className="text-on-surface-variant mb-4" style={{ maxWidth: '400px' }}>
        The route you're looking for doesn't exist in our system. It may have been moved or decommissioned.
      </p>
      <div className="d-flex gap-3">
        <Link to="/" className="text-decoration-none">
          <button className="btn btn-primary px-4 py-2 fw-bold">
            <span className="material-symbols-outlined me-2" style={{ fontSize: '18px' }}>home</span>
            Back to Home
          </button>
        </Link>
        <Link to="/cars" className="text-decoration-none">
          <button className="btn btn-outline-secondary px-4 py-2 fw-bold">
            Browse Cars
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
