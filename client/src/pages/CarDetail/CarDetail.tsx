import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { carService } from '../../services/carService';
import { reviewService } from '../../services/reviewService';
import { Car, Review } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Skeleton from '../../components/Skeleton/Skeleton';
import ReviewSummary from '../../components/Reviews/ReviewSummary';
import ReviewForm from '../../components/Reviews/ReviewForm';
import ReviewCard from '../../components/Reviews/ReviewCard';
import { SubScores } from '../../types';
import axios from 'axios';

import { generateCarReport } from '../../utils/pdfGenerator';
import { formatPriceRange } from '../../utils/formatPrice';
import './CarDetail.css';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [aggregatedSubScores, setAggregatedSubScores] = useState<SubScores | undefined>();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  /**
   * Fetches all necessary data for the car detail page in parallel.
   * This includes the core car info, all reviews, and the user's bookmark status.
   * Uses Promise.all to reduce waterfall loading times.
   */
  const fetchCarDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      const [carRes, reviewsRes, bookmarksRes] = await Promise.all([
        carService.getCarById(id!),
        reviewService.getReviews(id!),
        user ? carService.getBookmarks() : Promise.resolve({ success: false, data: [] })
      ]);
      
      if (carRes.success) setCar(carRes.data);
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data.reviews || []);
        setAggregatedSubScores(reviewsRes.data.aggregatedSubScores);
      }
      if (bookmarksRes.success && bookmarksRes.data) {
        const bookmarked = bookmarksRes.data.some((b: { _id?: string } | string) => typeof b === 'string' ? b === id : b._id === id);
        setIsBookmarked(bookmarked);
      }
    } catch {
      showToast('Failed to load vehicle telemetry', 'error');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, navigate, user]);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id, fetchCarDetails]);

  /**
   * Handles the submission of a new user review.
   * On success, it hides the form and re-fetches the car details to update the average rating.
   */
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

  /**
   * Toggles the bookmark state of the current car.
   * Checks if the user is authenticated first, and then either adds or removes
   * the car from their saved list, updating the UI accordingly.
   */
  const handleToggleBookmark = async () => {
    if (!user) {
      showToast('Please login to save cars', 'warning');
      return;
    }
    
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await carService.removeBookmark(id!);
        setIsBookmarked(false);
        showToast('Removed from Dashboard', 'info');
      } else {
        await carService.addBookmark(id!);
        setIsBookmarked(true);
        showToast('Saved to Dashboard', 'success');
      }
    } catch {
      showToast('Failed to update bookmarks', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      showToast('Please sign in first to do this', 'warning');
      return;
    }
    try {
      await reviewService.markHelpful(reviewId);
      fetchCarDetails();
    } catch {
      console.error('Failed to mark review as helpful');
    }
  };

  /**
   * Generates and downloads a comprehensive PDF report for the car.
   * Uses the client-side PDF generation utility (pdfGenerator.ts).
   */
  const handleDownloadReport = async () => {
    if (!car) return;
    try {
      showToast('Generating car report...', 'info');
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
            <span className="detail-price">{formatPriceRange(car.price, car.priceMax)}</span>
            <p className="font-mono text-on-surface-variant text-uppercase small m-0 mt-1">Price in Pakistan</p>
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
                  src={car.images[activeImageIndex] || '/placeholder.png'} 
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
                    <span className="material-symbols-outlined icon-lg" aria-hidden="true">speed</span>
                  </div>
                  <div>
                    <div className="spec-label">Engine</div>
                    <div className="spec-value">{car.specs?.engine || 'N/A'}</div>
                  </div>
                </div>

                <div className="spec-bento-card">
                  <div className="spec-bento-icon bg-secondary bg-opacity-10 text-secondary">
                    <span className="material-symbols-outlined icon-lg" aria-hidden="true">bolt</span>
                  </div>
                  <div>
                    <div className="spec-label">Power Output</div>
                    <div className="spec-value">{car.specs?.horsepower ? `${car.specs.horsepower} HP` : 'N/A'} / {car.specs?.torque ? `${car.specs.torque} Nm` : 'N/A'}</div>
                  </div>
                </div>

                <div className="spec-bento-card">
                  <div className="spec-bento-icon bg-tertiary bg-opacity-10 text-tertiary">
                    <span className="material-symbols-outlined icon-lg" aria-hidden="true">straighten</span>
                  </div>
                  <div>
                    <div className="spec-label">Dimensions</div>
                    <div className="spec-value">{car.specs?.dimensions || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-top border-secondary d-flex flex-column gap-3">
                <button 
                  className={`btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 active-glow ${isBookmarked ? 'btn-outline-primary text-on-surface' : 'btn-primary'}`}
                  onClick={handleToggleBookmark}
                  disabled={bookmarkLoading}
                >
                  <span className={`material-symbols-outlined icon-md icon-inline ${isBookmarked ? 'text-primary icon-filled' : ''}`} aria-hidden="true">favorite</span> 
                  {bookmarkLoading ? 'Updating...' : isBookmarked ? 'Saved to Dashboard' : 'Save to Dashboard'}
                </button>
                <button className="btn btn-outline-secondary text-on-surface w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleDownloadReport}>
                  <span className="material-symbols-outlined icon-md icon-inline" aria-hidden="true">download</span> Download Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-bottom border-secondary mt-5 mb-4 d-flex overflow-auto no-scrollbar">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>

        {/* Tab Content */}
        <div className="mb-5">
          {activeTab === 'overview' && (
            <div className="row g-4 fade-in-up">
              <div className="col-12 col-lg-8">
                <div className="glass-panel p-4 p-md-5 rounded-4">
                  <h3 className="font-heading mb-4">About This Car</h3>
                  <p className="text-on-surface-variant" style={{ lineHeight: '1.8' }}>
                    {car.description || `The ${car.year} ${car.make} ${car.model} comes with a ${car.specs?.engine || ''} engine, ${car.transmission} transmission, and seats ${car.specs?.seats || 5} people comfortably.`}
                  </p>
                  
                  <h4 className="font-heading mt-5 mb-4">Specifications</h4>
                  <div className="row g-3">
                    {[
                      { icon: 'directions_car', label: 'Body Type', val: car.bodyType || 'N/A' },
                      { icon: 'straighten', label: 'Dimensions', val: car.specs?.dimensions ? `${car.specs.dimensions} mm` : 'N/A' },
                      { icon: 'height', label: 'Ground Clearance', val: car.specs?.groundClearance ? `${car.specs.groundClearance} mm` : 'N/A' },
                      { icon: 'speed', label: 'Engine', val: car.specs?.engine || 'N/A' },
                      { icon: 'settings', label: 'Displacement', val: car.specs?.displacement ? `${car.specs.displacement} cc` : car.fuelType === 'Electric' ? 'Electric' : 'N/A' },
                      { icon: 'swap_driving_apps_wheel', label: 'Transmission', val: car.transmission || 'N/A' },
                      { icon: 'bolt', label: 'Horse Power', val: car.specs?.horsepower ? `${car.specs.horsepower} HP` : 'N/A' },
                      { icon: 'rotate_right', label: 'Torque', val: car.specs?.torque ? `${car.specs.torque} Nm` : 'N/A' },
                      { icon: 'work', label: 'Boot Space', val: car.specs?.bootSpace ? `${car.specs.bootSpace} L` : 'N/A' },
                      { icon: 'monitor_weight', label: 'Kerb Weight', val: car.specs?.kerbWeight || 'N/A' },
                      { icon: 'local_gas_station', label: car.fuelType === 'Electric' ? 'Battery' : 'Fuel Type', val: car.fuelType === 'Electric' ? (car.specs?.batteryCapacity ? `${car.specs.batteryCapacity} kWh` : 'N/A') : car.fuelType },
                      { icon: 'local_gas_station', label: car.fuelType === 'Electric' ? 'Range' : 'Mileage', val: car.fuelType === 'Electric' ? (car.specs?.range ? `${car.specs.range} KM` : 'N/A') : (car.specs?.mileage || 'N/A') },
                      { icon: 'oil_barrel', label: car.fuelType === 'Electric' ? 'Charging Time' : 'Fuel Tank', val: car.fuelType === 'Electric' ? (car.specs?.chargingTime ? `${car.specs.chargingTime} hrs` : 'N/A') : (car.specs?.fuelTankCapacity ? `${car.specs.fuelTankCapacity} L` : 'N/A') },
                      { icon: 'event_seat', label: 'Seating Capacity', val: car.specs?.seats ? `${car.specs.seats} Persons` : 'N/A' },
                      { icon: 'shutter_speed', label: 'Top Speed', val: car.specs?.topSpeed ? `${car.specs.topSpeed} KM/H` : 'N/A' },
                      { icon: 'tire_repair', label: 'Tyre Size', val: car.specs?.tyreSize || 'N/A' },
                    ].filter(s => s.val !== 'N/A').map((s, i) => (
                      <div key={i} className="col-6 col-md-4">
                        <div className="p-3 bg-surface-container-high rounded-3 border border-secondary h-100 d-flex align-items-center gap-3">
                          <span className="material-symbols-outlined icon-lg text-primary" aria-hidden="true">{s.icon}</span>
                          <div>
                            <span className="d-block font-mono text-on-surface-variant text-uppercase" style={{ fontSize: '10px' }}>{s.label}</span>
                            <span className="font-body fw-bold" style={{ fontSize: '14px' }}>{s.val}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
                    isEV={car.fuelType === 'Electric'}
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
                    <span className="material-symbols-outlined icon-xxl text-on-surface-variant mb-3" aria-hidden="true">speaker_notes_off</span>
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
