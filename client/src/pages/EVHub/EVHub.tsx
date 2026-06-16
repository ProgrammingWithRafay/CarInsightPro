import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car, FilterState } from '../../types';
import { formatPriceRange } from '../../utils/formatPrice';
import './EVHub.css'; // Optional

const EVHub: React.FC = () => {
  const [evCars, setEvCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    const fetchEVs = async () => {
      try {
        const res = await carService.getCars({ limit: 500 } as unknown as FilterState); // we will filter on client or could fetch all
        if (res.success) {
          const evs = res.data.filter(c => c.fuelType === 'Electric' || c.fuelType === 'Hybrid');
          setEvCars(evs);
        }
      } catch {
        console.error('Failed to load EVs');
      } finally {
        setLoading(false);
      }
    };
    fetchEVs();
  }, []);



  const totalPages = Math.ceil(evCars.length / limit);
  const paginatedCars = evCars.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const el = document.getElementById('fleet-section');
    if (el) {
      // Offset slightly for navbar
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      <div className="text-center mb-5 fade-in-up">
        <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 fs-6 mb-3 rounded-pill">
          <span className="material-symbols-outlined align-middle me-2 fs-5">bolt</span>
          Zero Emissions Future
        </span>
        <h1 className="display-4 font-heading fw-bold">EV & Hybrid Hub</h1>
        <p className="lead text-on-surface-variant max-w-container-max mx-auto" style={{ maxWidth: '700px' }}>
          Explore the latest in electric propulsion technology. Compare range, charging speeds, and battery capacities to find your perfect electrified vehicle.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="glass-panel p-4 rounded-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-heading text-primary mb-3">
              <span className="material-symbols-outlined align-middle me-2">electric_car</span>
              Why Go Electric?
            </h4>
            <div className="row text-on-surface-variant">
              <div className="col-md-6 mb-3 mb-md-0">
                <ul className="text-on-surface-variant d-flex flex-column gap-3 m-0 ps-3">
                  <li>
                    Significantly lower operating and maintenance costs over the vehicle lifespan.
                  </li>
                  <li>
                    Instant torque delivery for unparalleled acceleration performance.
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="text-on-surface-variant d-flex flex-column gap-3 m-0 ps-3">
                  <li>
                    Zero tailpipe emissions, contributing to cleaner urban air quality.
                  </li>
                  <li>
                    Access to federal and state tax incentives and HOV lane privileges.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 id="fleet-section" className="font-heading mb-4 fade-in-up">Electrified Fleet</h3>
      <div className="row g-4">
        {loading ? (
          <div className="text-center py-5 w-100"><div className="spinner-border text-primary" role="status"></div></div>
        ) : evCars.length > 0 ? (
          paginatedCars.map((car, idx) => (
            <div className="col-md-6 col-lg-4 fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }} key={car._id}>
              <div className="card h-100 bg-surface-container border-secondary position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 m-3 z-3">
                  <span className={`badge ${car.fuelType === 'Electric' ? 'bg-primary' : 'bg-secondary'} bg-opacity-75 fs-6 p-2 shadow`}>
                    {car.fuelType}
                  </span>
                </div>
                <img src={car.images[0] || '/placeholder.png'} className="card-img-top object-fit-cover" height="220" alt={car.model} />
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="card-title font-heading m-0">{car.year} {car.make} {car.model}</h4>
                    <span className="fw-bold text-primary fs-5">{formatPriceRange(car.price, car.priceMax)}</span>
                  </div>
                  
                  <div className="d-flex gap-3 mb-4 mt-3">
                    <div className="text-center">
                      <div className="font-mono text-on-surface-variant small text-uppercase">Range</div>
                      <div className="fw-bold">{car.specs?.range ? `${car.specs.range} mi` : 'N/A'}</div>
                    </div>
                    <div className="text-center border-start border-secondary ps-3">
                      <div className="font-mono text-on-surface-variant small text-uppercase">Battery</div>
                      <div className="fw-bold">{car.specs?.batteryCapacity ? `${car.specs.batteryCapacity} kWh` : 'N/A'}</div>
                    </div>
                    <div className="text-center border-start border-secondary ps-3">
                      <div className="font-mono text-on-surface-variant small text-uppercase">0-60 mph</div>
                      <div className="fw-bold">{parseInt(car.specs?.horsepower as string || '0') > 300 ? 'Fast' : 'Avg'}</div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link to={`/cars/${car._id}`} className="btn btn-outline-primary w-100">View Telemetry</Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <h4 className="text-on-surface-variant">No EVs or Hybrids found in inventory.</h4>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-5 fade-in-up">
          <div className="pagination-controls glass-panel p-2 rounded-pill d-flex gap-2">
            <button 
              className="btn btn-sm btn-icon border-0" 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="d-flex align-items-center px-3 font-mono fw-bold text-on-surface-variant">
              Page {page} of {totalPages}
            </div>

            <button 
              className="btn btn-sm btn-icon border-0" 
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVHub;
