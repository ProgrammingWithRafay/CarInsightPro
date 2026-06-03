import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car } from '../../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './EVHub.css'; // Optional

const EVHub: React.FC = () => {
  const [evCars, setEvCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEVs = async () => {
      try {
        const res = await carService.getCars({ limit: 500 } as any); // we will filter on client or could fetch all
        if (res.success) {
          const evs = res.data.filter(c => c.fuelType === 'Electric' || c.fuelType === 'Hybrid');
          setEvCars(evs);
        }
      } catch (error) {
        console.error('Failed to load EVs');
      } finally {
        setLoading(false);
      }
    };
    fetchEVs();
  }, []);

  // Data for scatter chart: Battery Capacity vs Range
  const chartData = evCars
    .filter(c => c.specs?.batteryCapacity && c.specs?.range)
    .map(c => ({
      id: c._id,
      name: `${c.make} ${c.model}`,
      capacity: c.specs.batteryCapacity,
      range: c.specs.range,
      price: c.price,
      type: c.fuelType
    }));

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
        <div className="col-lg-4">
          <div className="glass-panel p-4 rounded-4 h-100 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-heading text-primary mb-3">
              <span className="material-symbols-outlined align-middle me-2">electric_car</span>
              Why Go Electric?
            </h4>
            <ul className="list-unstyled d-flex flex-column gap-3 text-on-surface-variant">
              <li className="d-flex gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <span>Significantly lower operating and maintenance costs over the vehicle lifespan.</span>
              </li>
              <li className="d-flex gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <span>Instant torque delivery for unparalleled acceleration performance.</span>
              </li>
              <li className="d-flex gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <span>Zero tailpipe emissions, contributing to cleaner urban air quality.</span>
              </li>
              <li className="d-flex gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <span>Access to federal and state tax incentives and HOV lane privileges.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="glass-panel p-4 rounded-4 h-100 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-heading mb-4 text-center">Range vs. Battery Capacity Analysis</h4>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                    <XAxis type="number" dataKey="capacity" name="Battery (kWh)" unit=" kWh" stroke="var(--on-surface-variant)" />
                    <YAxis type="number" dataKey="range" name="Range (mi)" unit=" mi" stroke="var(--on-surface-variant)" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-container-highest p-3 border border-secondary rounded-3 shadow">
                              <p className="fw-bold m-0 mb-2 text-primary font-heading">{data.name}</p>
                              <p className="m-0 small text-on-surface-variant">Type: {data.type}</p>
                              <p className="m-0 small text-on-surface-variant">Battery: {data.capacity} kWh</p>
                              <p className="m-0 small text-on-surface-variant">Range: {data.range} miles</p>
                              <p className="m-0 fw-bold mt-2">${data.price.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="EVs" data={chartData.filter(d => d.type === 'Electric')} fill="var(--primary)" />
                    <Scatter name="Hybrids" data={chartData.filter(d => d.type === 'Hybrid')} fill="var(--secondary)" />
                    <Legend />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                {loading ? <p>Loading telemetry data...</p> : <p>Insufficient data points for scatter plot.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="font-heading mb-4 fade-in-up">Electrified Fleet</h3>
      <div className="row g-4">
        {loading ? (
          <div className="text-center py-5 w-100"><div className="spinner-border text-primary" role="status"></div></div>
        ) : evCars.length > 0 ? (
          evCars.map((car, idx) => (
            <div className="col-md-6 col-lg-4 fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }} key={car._id}>
              <div className="card h-100 bg-surface-container border-secondary position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 m-3 z-3">
                  <span className={`badge ${car.fuelType === 'Electric' ? 'bg-primary' : 'bg-secondary'} bg-opacity-75 fs-6 p-2 shadow`}>
                    {car.fuelType}
                  </span>
                </div>
                <img src={car.images[0] || 'https://via.placeholder.com/400x300'} className="card-img-top object-fit-cover" height="220" alt={car.model} />
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="card-title font-heading m-0">{car.year} {car.make} {car.model}</h4>
                    <span className="fw-bold text-primary fs-5">${car.price.toLocaleString()}</span>
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
                      <div className="fw-bold">{car.specs?.horsepower > 300 ? 'Fast' : 'Avg'}</div>
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
    </div>
  );
};

export default EVHub;
