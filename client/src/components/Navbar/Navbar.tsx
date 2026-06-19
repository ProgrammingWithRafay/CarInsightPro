import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeOffcanvas = () => {
    const closeBtn = document.querySelector('#mobileMenu .btn-close') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.click();
    }
  };

  return (
    <>
      <header className="fixed-top navbar-stitch">
      <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 py-3 d-flex justify-content-between align-items-center">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img src="/logo.png" alt="CarInsight Pro Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
          <span className="navbar-brand-text">CarInsight Pro</span>
        </Link>
        
        <nav className="d-none d-md-flex align-items-center gap-4">
          <Link to="/" className={`text-decoration-none nav-link-stitch ${isActive('/')}`}>Home</Link>
          <Link to="/cars" className={`text-decoration-none nav-link-stitch ${isActive('/cars')}`}>Cars</Link>
          <Link to="/compare" className={`text-decoration-none nav-link-stitch ${isActive('/compare')}`}>Compare</Link>
          <Link to="/ev-hub" className={`text-decoration-none nav-link-stitch ${isActive('/ev-hub')}`}>EV Hub</Link>
          {user?.role === 'user' && <Link to="/matchmaker" className={`text-decoration-none nav-link-stitch ${isActive('/matchmaker')}`}>Matchmaker</Link>}
          {user?.role === 'user' && <Link to="/dashboard" className={`text-decoration-none nav-link-stitch ${isActive('/dashboard')}`}>Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={`text-decoration-none nav-link-stitch ${isActive('/admin')}`}>Admin Panel</Link>}
        </nav>

        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="icon-btn text-decoration-none d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, overflow: 'hidden' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <span className="material-symbols-outlined icon-md icon-inline" aria-hidden="true">account_circle</span>
                )}
              </Link>
              <button className="btn-signin bg-transparent border border-secondary text-on-surface d-none d-sm-block" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="icon-btn text-decoration-none">
                <span className="material-symbols-outlined icon-md icon-inline" aria-hidden="true">account_circle</span>
              </Link>
              <Link to="/login" className="text-decoration-none d-none d-sm-block">
                <button className="btn-signin active-glow">Sign In</button>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Toggle (Simplified for now) */}
          <button className="icon-btn d-md-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
            <span className="material-symbols-outlined icon-md" aria-hidden="true">menu</span>
          </button>
        </div>
      </div>
      </header>

      {/* Offcanvas Mobile Menu */}
      <div className="offcanvas offcanvas-end bg-surface border-start border-secondary" tabIndex={-1} id="mobileMenu">
        <div className="offcanvas-header border-bottom border-secondary">
          <h5 className="font-heading text-primary m-0">Menu</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <Link to="/" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Home</Link>
          <Link to="/cars" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Cars</Link>
          <Link to="/compare" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Compare</Link>
          <Link to="/ev-hub" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>EV Hub</Link>
          {user?.role === 'user' && <Link to="/matchmaker" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Matchmaker</Link>}
          {user?.role === 'user' && <Link to="/dashboard" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-decoration-none text-on-surface fs-5 font-heading" onClick={closeOffcanvas}>Admin Panel</Link>}
          
          <hr className="border-secondary my-2" />
          
          {user ? (
            <button className="btn btn-outline-danger mt-2" onClick={() => { logout(); closeOffcanvas(); }}>Logout</button>
          ) : (
            <Link to="/login" className="btn btn-primary mt-2" onClick={closeOffcanvas}>Sign In</Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
