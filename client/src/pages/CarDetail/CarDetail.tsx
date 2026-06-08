import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { carService } from '../../services/carService';
import { reviewService } from '../../services/reviewService';
import { Car, Review } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Skeleton from '../../components/Skeleton/Skeleton';
import ReviewSummary from '../../components/Reviews/ReviewSummary';
import ReviewForm from '../../components/Reviews/ReviewForm';
import ReviewCard from '../../components/Reviews/ReviewCard';
import TCOCalculator from '../../components/TCOCalculator/TCOCalculator';
import { SubScores } from '../../types';
import axios from 'axios';

import { generateCarReport } from '../../utils/pdfGenerator';
import './CarDetail.css';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [aggregatedSubScores, setAggregatedSubScores] = useState<SubScores | undefined>();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchCarDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      const [carRes, reviewsRes] = await Promise.all([
        carService.getCarById(id!),
        reviewService.getReviews(id!)
      ]);
      
      if (carRes.success) setCar(carRes.data);
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data.reviews || []);
        setAggregatedSubScores(reviewsRes.data.aggregatedSubScores);
      }
    } catch {
      showToast('Failed to load vehicle telemetry', 'error');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id, fetchCarDetails]);

  const handleAddReview = async (data: { title: string; subScores: SubScores; comment: string }) => {
    try {
      const res = await reviewService.addReview(id!, data);
      if (res.success) {
        showToast('Review submitted successfully', 'success');
        setShowReviewForm(false);
        fetchCarDetails();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data?.message || 'Failed to submit review', 'error');
      } else {
        showToast('Failed to submit review', 'error');
      }
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      showToast('Please login to mark as helpful', 'warning');
      return;
    }
    try {
      await reviewService.markHelpful(reviewId);
      fetchCarDetails();
    } catch {
      console.error('Failed to mark review as helpful');
    }
  };

  const handleDownloadReport = async () => {
    if (!car) return;
    try {
      showToast('Generating vehicle intelligence report...', 'info');
      await generateCarReport(car, reviews);
      showToast('Report downloaded successfully', 'success');
    } catch {
      showToast('Failed to generate report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid max-w-container-max mx-auto px-3 pt-5 mt-5">
        <Skeleton height="40px" width="300px" className="mb-4" />
        <div className="row g-4">
          <div className="col-lg-8"><Skeleton height="500px" className="rounded-4" /></div>
          <div className="col-lg-4"><Skeleton height="500px" className="rounded-4" /></div>
        </div>
      </div>
    );
  }

  if (!car) return null;

  // Mock Radar Data based on car specs
  const radarData = [
    { subject: 'Performance', A: car.specs?.horsepower ? Math.min(car.specs.horsepower / 5, 100) : 80, fullMark: 100 },
    { subject: 'Efficiency', A: car.fuelType === 'Electric' ? 98 : (car.fuelType === 'Hybrid' ? 85 : 60), fullMark: 100 },
    { subject: 'Comfort', A: 85, fullMark: 100 },
    { subject: 'Reliability', A: 90, fullMark: 100 },
    { subject: 'Technology', A: car.year >= 2022 ? 95 : 75, fullMark: 100 },
    { subject: 'Value', A: 88, fullMark: 100 },
  ];

  return (
    <div className="pt-5 mt-4 pb-5 bg-surface text-on-surface" id="car-report-content">
      
      {/* Breadcrumb & Header */}
      <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 mb-4">
        <div className="detail-breadcrumb mb-3">
          <Link to="/cars">INVENTORY</Link> <span className="mx-2">/</span>
          <span className="text-on-surface">{car.make}</span> <span className="mx-2">/</span>
          <span className="text-primary">{car.model}</span>
        </div>

        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
          <div>
            <h1 className="font-heading detail-title m-0">{car.year} {car.make} {car.model}</h1>
            <div className="d-flex gap-2 mt-2">
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50">{car.fuelType}</span>
              <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50">{car.transmission}</span>
            </div>
          </div>
          <div className="text-lg-end">
            <span className="detail-price">${car.price.toLocaleString()}</span>
            <p className="font-mono text-on-surface-variant text-uppercase small m-0 mt-1">Est. Market Value</p>
          </div>
        </div>
      </div>

      <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4">
        <div className="row g-4">
          
          {/* Main Gallery */}
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              <div className="detail-gallery-main" style={{ height: '500px', overflow: 'hidden' }}>
                <img 
                  src={car.images[activeImageIndex] || 'https://via.placeholder.com/800x600'} 
                  alt={car.model} 
                  className="detail-gallery-img"
                />
              </div>
              {car.images.length > 1 && (
                <div className="d-flex gap-2 overflow-auto pb-2 no-scrollbar">
                  {car.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`detail-thumbnail flex-shrink-0 w-25 ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt="thumbnail" className="w-100 h-100 object-fit-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Quick Specs & Actions */}
          <div className="col-lg-4">
            <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column">
              <h3 className="font-heading h4 mb-4">Core Telemetry</h3>
              
              <div className="d-flex flex-column gap-3 flex-grow-1">
                <div className="spec-bento-card">
                  <div className="spec-bento-icon bg-primary bg-opacity-10 text-primary">
                    <span className="material-symbols-outlined">speed</span>
                  </div>
                  <div>
                    <div className="spec-label">Engine</div>
                    <div className="spec-value">{car.specs?.engine || 'N/A'}</div>
                  </div>
                </div>

                <div className="spec-bento-card">
                  <div className="spec-bento-icon bg-secondary bg-opacity-10 text-secondary">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <div className="spec-label">Power Output</div>
                    <div className="spec-value">{car.specs?.horsepower ? `${car.specs.horsepower} HP` : 'N/A'} / {car.specs?.torque ? `${car.specs.torque} lb-ft` : 'N/A'}</div>
                  </div>
                </div>

                <div className="spec-bento-card">
                  <div className="spec-bento-icon bg-tertiary bg-opacity-10 text-tertiary">
                    <span className="material-symbols-outlined">straighten</span>
                  </div>
                  <div>
                    <div className="spec-label">Dimensions</div>
                    <div className="spec-value">{car.specs?.dimensions?.length || 'N/A'}L x {car.specs?.dimensions?.width || 'N/A'}W</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-top border-secondary d-flex flex-column gap-3">
                <button className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 active-glow">
                  <span className="material-symbols-outlined">favorite</span> Save to Dashboard
                </button>
                <button className="btn btn-outline-secondary text-on-surface w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleDownloadReport}>
                  <span className="material-symbols-outlined">download</span> Download Dossier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-bottom border-secondary mt-5 mb-4 d-flex overflow-auto no-scrollbar">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`tab-btn ${activeTab === 'tco' ? 'active' : ''}`} onClick={() => setActiveTab('tco')}>TCO & Finance</button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>

        {/* Tab Content */}
        <div className="mb-5">
          {activeTab === 'overview' && (
            <div className="row g-4 fade-in-up">
              <div className="col-12 col-lg-8">
                <div className="glass-panel p-4 p-md-5 rounded-4">
                  <h3 className="font-heading mb-4">Vehicle Summary</h3>
                  <p className="text-on-surface-variant" style={{ lineHeight: '1.8' }}>
                    {`The ${car.year} ${car.make} ${car.model} represents a significant entry in the ${car.fuelType} segment. Equipped with a robust ${car.specs?.engine || 'engine'} and a refined ${car.transmission} transmission, it offers a balanced blend of performance and efficiency.`}
                  </p>
                  
                  <h4 className="font-heading mt-5 mb-4">Detailed Specifications</h4>
                  <div className="row g-4">
                    {[
                      { label: 'Curb Weight', val: car.specs?.curbWeight ? `${car.specs.curbWeight.toLocaleString()} lbs` : 'N/A' },
                      { label: 'Torque', val: car.specs?.torque ? `${car.specs.torque} lb-ft` : 'N/A' },
                      { label: 'Drivetrain', val: car.specs?.drivetrain || 'N/A' },
                      { label: 'Fuel Economy', val: car.specs?.mileage_city ? `${car.specs.mileage_city} / ${car.specs?.mileage_highway} MPG` : 'N/A' },
                      { label: 'Cargo Space', val: car.specs?.cargoSpace ? `${car.specs.cargoSpace} cu ft` : 'N/A' },
                      { label: 'Displacement', val: car.specs?.displacement ? `${car.specs.displacement} cc` : 'Electric' }
                    ].map((s, i) => (
                      <div key={i} className="col-6 col-md-4">
                        <div className="p-3 bg-surface-container-high rounded-3 border border-secondary h-100">
                          <span className="d-block font-mono text-on-surface-variant text-uppercase" style={{ fontSize: '10px' }}>{s.label}</span>
                          <span className="font-body fw-bold">{s.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="row g-4 fade-in-up">
              <div className="col-lg-6">
                <div className="chart-container-card h-100">
                  <h4 className="font-heading mb-4">Performance Matrix</h4>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#424754" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#c2c6d6', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                        <Radar name={car.model} dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="chart-container-card h-100">
                  <h4 className="font-heading mb-4">Depreciation Curve (Projected)</h4>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={[
                        { year: 'Year 1', value: car.price * 0.85 },
                        { year: 'Year 3', value: car.price * 0.65 },
                        { year: 'Year 5', value: car.price * 0.45 },
                        { year: 'Year 7', value: car.price * 0.30 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#424754" vertical={false} />
                        <XAxis dataKey="year" stroke="#c2c6d6" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                        <YAxis stroke="#c2c6d6" tickFormatter={(value) => `$${value/1000}k`} tick={{ fontFamily: 'JetBrains Mono', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1d2027', borderColor: '#424754', color: '#e1e2ec' }} />
                        <Bar dataKey="value" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tco' && (
            <TCOCalculator car={car} />
          )}

          {activeTab === 'reviews' && (
            <div className="row fade-in-up">
              <div className="col-12">
                <ReviewSummary 
                  totalReviews={reviews.length} 
                  averageRating={car.avgRating} 
                  aggregatedSubScores={aggregatedSubScores} 
                />
              </div>

              <div className="col-lg-8 mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="font-heading m-0">Verified Telemetry Reviews</h3>
                  {user && !showReviewForm && (
                    <button className="btn btn-outline-primary" onClick={() => setShowReviewForm(true)}>Add Review</button>
                  )}
                </div>
                
                {showReviewForm && (
                  <ReviewForm 
                    onSubmit={handleAddReview} 
                    onCancel={() => setShowReviewForm(false)} 
                  />
                )}

                {!showReviewForm && reviews.length > 0 ? (
                  <div className="d-flex flex-column gap-3 mt-4">
                    {reviews.map(review => (
                      <ReviewCard 
                        key={review._id} 
                        review={review} 
                        currentUserId={user?._id}
                        onHelpful={handleHelpful}
                      />
                    ))}
                  </div>
                ) : !showReviewForm && (
                  <div className="glass-panel p-5 text-center rounded-4 mt-4">
                    <span className="material-symbols-outlined text-on-surface-variant mb-3" style={{ fontSize: '48px' }}>speaker_notes_off</span>
                    <h5 className="font-heading">No reviews logged yet.</h5>
                    <p className="text-on-surface-variant">Be the first to provide technical feedback.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
