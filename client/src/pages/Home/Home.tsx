import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car } from '../../types';
import CarCard from '../../components/CarCard/CarCard';
import Counter from '../../components/Counter/Counter';
import './Home.css';

const Home: React.FC = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await carService.getFeatured();
        if (res.success) {
          setFeaturedCars(res.data);
        }
      } catch {
        console.error('Failed to load featured cars');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pt-5 mt-4">
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
            <div className="stat-value"><Counter end={150} suffix="k+" /></div>
            <div className="stat-label">Cars Listed</div>
          </div>
          <div className="stat-divider d-none d-md-block"></div>
          <div className="stat-item">
            <div className="stat-value"><Counter end={200} suffix="k+" /></div>
            <div className="stat-label">User Reviews</div>
          </div>
          <div className="stat-divider d-none d-md-block"></div>
          <div className="stat-item">
            <div className="stat-value"><Counter end={12} suffix="ms" /></div>
            <div className="stat-label">Fast Loading</div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-5 my-5 px-3 px-md-5 max-w-container-max mx-auto">
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
            { icon: 'insights', title: 'Price Trends', desc: 'See how car prices have changed over time with simple, easy-to-read charts.' },
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
      <section className="py-5 my-5 bg-surface-container-lowest">
        <div className="container py-5">
          <h2 className="font-heading display-5 fw-bold text-center mb-5 pb-4">How It Works</h2>
          <div className="position-relative">
            <div className="timeline-line"></div>

            <div className="row align-items-center mb-5 pb-5 position-relative">
              <div className="col-md-5 text-md-end d-none d-md-block">
                <h4 className="font-heading text-primary h3">Search</h4>
                <p className="text-on-surface-variant">Tell us what kind of car you're looking for. Use filters or just browse around.</p>
              </div>
              <div className="col-2 col-md-2 d-flex justify-content-center">
                <div className="timeline-number step-1">1</div>
              </div>
              <div className="col-10 col-md-5">
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
              <div className="col-2 col-md-2 d-flex justify-content-center order-md-2">
                <div className="timeline-number step-2">2</div>
              </div>
              <div className="col-10 col-md-5 text-md-end order-md-1">
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
              <div className="col-2 col-md-2 d-flex justify-content-center">
                <div className="timeline-number step-3">3</div>
              </div>
              <div className="col-10 col-md-5">
                <h4 className="font-heading text-tertiary h3 d-md-none">Decide</h4>
                <p className="text-on-surface-variant d-md-none mb-2">Download a PDF report, save your bookmarks, and make your decision with confidence.</p>
                <span className="badge border border-tertiary text-tertiary bg-transparent py-2 px-3">DECIDE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Cars Carousel */}
      <section className="py-5 my-5 overflow-hidden">
        <div className="px-3 px-md-5 max-w-container-max mx-auto mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="font-heading display-6 fw-bold m-0">Popular Cars</h2>
            <p className="text-on-surface-variant m-0">Cars people are looking at the most right now.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary rounded-circle p-2 d-flex"><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="btn btn-secondary rounded-circle p-2 d-flex"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>

        <div className="d-flex gap-4 px-3 px-md-5 pb-4" style={{ overflowX: 'auto', scrollBehavior: 'smooth' }}>
          {loading ? (
            <div className="d-flex justify-content-center w-100 py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : featuredCars.length > 0 ? (
            featuredCars.map(car => (
              <div key={car._id} style={{ minWidth: '320px', maxWidth: '400px' }}>
                <CarCard car={car} />
              </div>
            ))
          ) : (
            <p className="text-on-surface-variant w-100 text-center">No featured cars found.</p>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 px-3">
        <div className="max-w-container-max mx-auto" style={{ maxWidth: '900px' }}>
          <div className="testimonial-card" style={{ backgroundColor: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
            <span className="material-symbols-outlined testimonial-quote-icon">format_quote</span>
            <p className="testimonial-text mb-5">
              "I used to spend weeks going back and forth between different sites trying to compare cars. CarInsight Pro puts everything in one place. It honestly saved me so much time and I ended up finding a better deal than I expected."
            </p>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-surface overflow-hidden border border-secondary" style={{ width: '56px', height: '56px' }}>
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA_Nc_tMSqSGUhf-jM73K8F0UM5rbUEtoKvc4MxWwz-YN_jc6eIRiiAiwxAUdWbJPgpeEja_WCmh3vN-5GxEMcTbMwrSyKJzWNe_kwf5Sa29XCeq0pARYNzJH2xpRwVpqxtPKmJ-8nPgZ5Qc7W8EaUbOKZ9VfYFT_4HXYfi3C09xoNd0fvEadGmLbEnub7oGXAOeHkxLJu4t1ja_hctbvSMVtCU3Riptwtcq2d8MJG78afv9wHIku0Jr1Slifrp6Ej_LHFyS-PQGtt" alt="Marcus Thorne" className="w-100 h-100 object-fit-cover" />
              </div>
              <div>
                <div className="fw-bold text-on-surface">Marcus Thorne</div>
                <div className="text-on-surface-variant data-mono text-uppercase" style={{ fontSize: '10px' }}>Car Enthusiast & First-Time Buyer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-5 mb-5 px-3">
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

    </div>
  );
};

export default Home;
