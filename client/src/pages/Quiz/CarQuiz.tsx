import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car } from '../../types';
import { formatPKR, formatPriceRange } from '../../utils/formatPrice';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Tooltip } from 'recharts';

type RecommendedCar = Car & { matchScore: number; matchPercentage: number };

const CarQuiz: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendedCar[]>([]);
  
  const [budget, setBudget] = useState<number>(2000000); 
  const [usage, setUsage] = useState<string>('');
  const [seats, setSeats] = useState<number>(0);
  const [fuelType, setFuelType] = useState<string>('');

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await carService.recommendCars(budget, usage, seats, fuelType);
      if (res.success && res.data) {
        setResults(res.data.slice(0, 3)); 
      }
      setStep(5); 
    } catch (_error) {
      console.error(_error);
    } finally {
      setLoading(false);
    }
  };

  const getRadarData = () => {
    if (results.length === 0) return [];
    
    const axes = ['Performance', 'Comfort', 'Efficiency', 'Value', 'Safety'];
    
    return axes.map(axis => {
      const dataPoint: Record<string, string | number> = { subject: axis };
      results.forEach(car => {
        let score = 50;
        if (axis === 'Performance') score = Math.min((car.specs?.horsepower || 100) / 4, 100);
        if (axis === 'Comfort') score = (car.specs?.seats || 5) * 15;
        if (axis === 'Efficiency') score = car.fuelType === 'Electric' ? 95 : (car.specs?.mileage_highway || 20) * 2;
        if (axis === 'Value') score = Math.max(100 - (car.price / 1000), 40);
        if (axis === 'Safety') score = (car.specs?.seats || 5) * 15;
        
        dataPoint[car.model] = Math.min(Math.max(score, 0), 100);
      });
      return dataPoint;
    });
  };

  const radarColors = ['#1E63FF', '#00C853', '#FF6D00'];

  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 py-5 mt-5">
      <h1 className="font-heading mb-4 text-center">Find Your Perfect Car</h1>
      
      {step < 5 && (
        <div className="mx-auto glass-panel p-4 p-md-5 rounded-4" style={{ maxWidth: '600px' }}>
          <div className="progress mb-4" style={{ height: '8px', backgroundColor: 'var(--surface-container-high)' }}>
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          {step === 1 && (
            <div className="fade-in">
              <h3 className="mb-4 font-heading">What's your maximum budget?</h3>
              <p className="text-on-surface-variant mb-4">Set your target price range.</p>
              <h2 className="text-primary text-center mb-4">{formatPKR(budget)}</h2>
              <input 
                type="range" 
                className="form-range" 
                min="300000" 
                max="100000000" 
                step="100000" 
                value={budget} 
                onChange={e => setBudget(Number(e.target.value))} 
              />
              <div className="d-flex justify-content-between text-on-surface-variant small mt-2">
                <span>PKR 3 Lacs</span>
                <span>PKR 10 Crore</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h3 className="mb-4 font-heading">Primary usage?</h3>
              <div className="d-flex flex-column gap-3">
                {[
                  { value: 'city', label: 'City', desc: 'Daily commute & heavy traffic' },
                  { value: 'highway', label: 'Highway', desc: 'Long routes & motorways' },
                  { value: 'mixed', label: 'Mixed', desc: 'All-rounder usage' }
                ].map(u => (
                  <button 
                    key={u.value}
                    className={`btn p-3 text-start border ${usage === u.value ? 'btn-primary' : 'btn-outline-secondary text-on-surface'}`}
                    onClick={() => setUsage(u.value)}
                  >
                    <span className="fw-bold d-block">{u.label} Driving</span>
                    <small className={usage === u.value ? 'text-white-50' : 'text-on-surface-variant'}>{u.desc}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h3 className="mb-4 font-heading">Minimum seats required?</h3>
              <div className="row g-3">
                {[
                  { seats: 4, label: 'Small / Hatchback' },
                  { seats: 5, label: 'Standard / Sedan' },
                  { seats: 7, label: 'Large Family / SUV' },
                  { seats: 8, label: 'Van / Multi-purpose' }
                ].map(s => (
                  <div className="col-6" key={s.seats}>
                    <button 
                      className={`btn w-100 p-4 border ${seats === s.seats ? 'btn-primary' : 'btn-outline-secondary text-on-surface'}`}
                      onClick={() => setSeats(s.seats)}
                    >
                      <h3 className="m-0 font-heading">{s.seats}{s.seats === 8 ? '+' : ''}</h3>
                      <span className="small">{s.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in">
              <h3 className="mb-4 font-heading">Preferred fuel type?</h3>
              <div className="d-flex flex-column gap-3">
                {[
                  { value: 'Petrol', desc: 'Standard choice, easy maintenance' },
                  { value: 'Hybrid', desc: 'Excellent fuel economy for city' },
                  { value: 'Diesel', desc: 'Better torque for SUVs & loaders' },
                  { value: 'Electric', desc: 'Zero emissions, growing trend' }
                ].map(f => (
                  <button 
                    key={f.value}
                    className={`btn p-3 text-start border ${fuelType === f.value ? 'btn-primary' : 'btn-outline-secondary text-on-surface'}`}
                    onClick={() => setFuelType(f.value)}
                  >
                    <span className="fw-bold d-block">{f.value}</span>
                    <small className={fuelType === f.value ? 'text-white-50' : 'text-on-surface-variant'}>{f.desc}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-5 pt-3 border-top border-secondary">
            <button className="btn btn-outline-secondary text-on-surface" onClick={handlePrev} disabled={step === 1}>Back</button>
            {step < 4 ? (
              <button className="btn btn-primary" onClick={handleNext}>Next Step</button>
            ) : (
              <button className="btn btn-primary active-glow" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Analyzing...' : 'Show My Matches'}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="fade-in-up">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="font-heading m-0">Your Top Matches</h2>
            <button className="btn btn-outline-secondary text-on-surface" onClick={() => setStep(1)}>Retake Quiz</button>
          </div>

          {results.length > 0 ? (
            <>
              <div className="row g-4 mb-5">
                {results.map((car) => (
                  <div className="col-md-4" key={car._id}>
                    <div className="card bg-surface-container border-secondary h-100 position-relative overflow-hidden">
                      <div className="position-absolute top-0 end-0 m-3 z-3">
                        <span className="badge bg-success fs-6 p-2 shadow-sm border border-success">
                          {car.matchPercentage}% Match
                        </span>
                      </div>
                      <img src={car.images[0] || 'https://via.placeholder.com/400x300'} className="card-img-top object-fit-cover" height="200" alt={car.model} />
                      <div className="card-body p-4 d-flex flex-column">
                        <h4 className="card-title font-heading">{car.year} {car.make} {car.model}</h4>
                        <p className="text-primary fw-bold fs-5">{formatPriceRange(car.price, car.priceMax)}</p>
                        <div className="mt-auto pt-3">
                          <Link to={`/cars/${car._id}`} className="btn btn-outline-primary w-100">View Details</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-4 p-md-5 rounded-4 mt-5">
                <h3 className="font-heading mb-4 text-center">Comparative Analysis</h3>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                      <PolarGrid stroke="#424754" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#c2c6d6', fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1d2027', borderColor: '#424754', color: '#fff' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      {results.map((car, idx) => (
                        <Radar key={car._id} name={car.model} dataKey={car.model} stroke={radarColors[idx]} fill={radarColors[idx]} fillOpacity={0.4} />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-5 text-center rounded-4">
              <h4 className="font-heading">No exact matches found.</h4>
              <p className="text-on-surface-variant">Try adjusting your budget or preferences.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarQuiz;
