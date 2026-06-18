import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { useAuth } from '../../hooks/useAuth';

import Counter from '../../components/Counter/Counter';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalCars: 0, totalReviews: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes] = await Promise.all([
          carService.getPublicStats()
        ]);
        
        if (statsRes.success) {
          setStats(statsRes.data);
        }
      } catch {
        console.error('Failed to load home page data');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="position-relative z-10 text-center px-3 max-w-container-max mx-auto" style={{ maxWidth: '900px' }}>
          <span className="hero-badge">CAR RESEARCH, SIMPLIFIED</span>
          <h1 className="hero-title font-heading">Find the Right Car Without the Guesswork</h1>
          <p className="hero-subtitle">
            Look up any car, compare it with others, read honest reviews, and figure out what's actually worth your money. All in one place.
          </p>
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mt-5">
            <Link to="/cars" className="text-decoration-none">
              <button className="hero-btn-primary bg-primary text-on-primary border-0 rounded-4 fw-bold w-100 justify-content-center">
                Browse Cars <span className="material-symbols-outlined">directions_car</span>
              </button>
            </Link>
            <Link to="/contact" className="text-decoration-none">
              <button className="hero-btn-secondary rounded-4 fw-bold" style={{ border: '1px solid var(--outline-variant)' }}>
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-3 px-md-5 stats-bar-wrapper">
        <div className="p-4 p-md-5 rounded-4 d-flex flex-wrap justify-content-around align-items-center gap-4 max-w-container-max mx-auto" style={{ backgroundColor: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
          <div className="stat-item">
            <div className="stat-value"><Counter end={stats.totalCars} suffix="+" /></div>
            <div className="stat-label">Cars Listed</div>
          </div>
          <div className="stat-divider d-none d-md-block"></div>
          <div className="stat-item">
            <div className="stat-value"><Counter end={stats.totalReviews} suffix="+" /></div>
            <div className="stat-label">User Reviews</div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="section-padding px-3 px-md-5 max-w-container-max mx-auto">
        <div className="text-center mb-5 pb-3">
          <h2 className="font-heading display-5 fw-bold text-on-surface mb-3">What You Can Do</h2>
          <p className="text-on-surface-variant max-w-container-max mx-auto" style={{ maxWidth: '600px' }}>
            Everything you need to research a car before you buy, all in one place.
          </p>
        </div>

        <div className="row g-4">
          {[
            { icon: 'search', title: 'Search & Filter', desc: 'Filter by make, model, year, price, fuel type, or whatever matters to you. Find exactly what you\'re looking for.' },
            { icon: 'compare_arrows', title: 'Compare Cars', desc: 'Put two or more cars next to each other and see how they stack up on specs, price, and features.' },
            { icon: 'description', title: 'PDF Reports', desc: 'Download a clean PDF summary of any comparison. Handy if you want to share it or look at it later.' },
            { icon: 'bookmark', title: 'Save Favorites', desc: 'Bookmark the cars you like and easily access them anytime from your personal dashboard.' },
            { icon: 'verified_user', title: 'Honest Reviews', desc: 'Read reviews from real people who actually own these cars. No fake stuff.' },
            { icon: 'admin_panel_settings', title: 'Admin Dashboard', desc: 'If you\'re an admin, you can manage car listings, users, reviews, and support messages from one place.' }
          ].map((feat, idx) => (
            <div key={idx} className="col-12 col-md-4">
              <div className="bento-card h-100">
                <div className="bento-icon-wrapper">
                  <span className="material-symbols-outlined text-primary">{feat.icon}</span>
                </div>
                <h3 className="font-heading h4 text-on-surface mb-2">{feat.title}</h3>
                <p className="text-on-surface-variant m-0">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding bg-surface-container-lowest">
        <div className="container">
          <h2 className="font-heading display-5 fw-bold text-center mb-5 pb-4">How It Works</h2>
          <div className="position-relative">
            <div className="timeline-line"></div>

            <div className="row align-items-center mb-5 pb-5 position-relative">
              <div className="col-md-5 text-md-end d-none d-md-block">
                <h4 className="font-heading text-primary h3">Search</h4>
                <p className="text-on-surface-variant">Tell us what kind of car you're looking for. Use filters or just browse around.</p>
              </div>
              <div className="col-3 col-md-2 d-flex justify-content-center">
                <div className="timeline-number step-1">1</div>
              </div>
              <div className="col-9 col-md-5">
                <h4 className="font-heading text-primary h3 d-md-none">Search</h4>
                <p className="text-on-surface-variant d-md-none mb-2">Tell us what kind of car you're looking for. Use filters or just browse around.</p>
                <span className="badge border border-primary text-primary bg-transparent py-2 px-3">SEARCH</span>
              </div>
            </div>

            <div className="row align-items-center mb-5 pb-5 position-relative">
              <div className="col-md-5 text-md-start order-md-3 d-none d-md-block">
                <h4 className="font-heading text-secondary h3">Compare</h4>
                <p className="text-on-surface-variant">Put your favorites side by side. See which one actually gives you the most for your budget.</p>
              </div>
              <div className="col-3 col-md-2 d-flex justify-content-center order-md-2">
                <div className="timeline-number step-2">2</div>
              </div>
              <div className="col-9 col-md-5 text-md-end order-md-1">
                <h4 className="font-heading text-secondary h3 d-md-none">Compare</h4>
                <p className="text-on-surface-variant d-md-none mb-2">Put your favorites side by side. See which one actually gives you the most for your budget.</p>
                <span className="badge border border-secondary text-secondary bg-transparent py-2 px-3">COMPARE</span>
              </div>
            </div>

            <div className="row align-items-center position-relative">
              <div className="col-md-5 text-md-end d-none d-md-block">
                <h4 className="font-heading text-tertiary h3">Decide</h4>
                <p className="text-on-surface-variant">Download a PDF report, save your bookmarks, and make your decision with confidence.</p>
              </div>
              <div className="col-3 col-md-2 d-flex justify-content-center">
                <div className="timeline-number step-3">3</div>
              </div>
              <div className="col-9 col-md-5">
                <h4 className="font-heading text-tertiary h3 d-md-none">Decide</h4>
                <p className="text-on-surface-variant d-md-none mb-2">Download a PDF report, save your bookmarks, and make your decision with confidence.</p>
                <span className="badge border border-tertiary text-tertiary bg-transparent py-2 px-3">DECIDE</span>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* CTA Banner */}
      {!user && (
        <section className="section-padding px-3">
          <div className="max-w-container-max mx-auto cta-banner">
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25"></div>
            <div className="position-relative z-10">
              <h2 className="font-heading fw-bold cta-title mb-3">Ready to find your next car?</h2>
              <p className="cta-subtitle mb-5 max-w-container-max mx-auto" style={{ maxWidth: '600px' }}>
                Create a free account and start comparing cars in minutes. No credit card, no commitments.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                <Link to="/register"><button className="btn-cta-primary w-100">Sign Up Free</button></Link>
                <Link to="/contact"><button className="btn-cta-secondary">Contact Us</button></Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
