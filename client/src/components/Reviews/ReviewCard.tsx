import React from 'react';
import { Review, User } from '../../types';
import './Reviews.css';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (id: string) => void;
  currentUserId?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful, currentUserId }) => {
  const user = review.user as User;
  
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-symbols-outlined icon-sm ${i <= rating ? 'text-warning icon-filled' : 'text-on-surface-variant'}`} aria-hidden="true">
          star
        </span>
      );
    }
    return stars;
  };

  const isHelpful = currentUserId && review.helpful.includes(currentUserId);

  return (
    <div className="review-card glass-panel p-4 rounded-4 mb-3">
      <div className="review-card-header mb-3">
        <div className="d-flex align-items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="rounded-circle" width="48" height="48" />
          ) : (
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white font-heading fs-5" style={{ width: '48px', height: '48px' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h5 className="m-0 font-heading">{user.name}</h5>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex">{renderStars(review.rating)}</div>
              <span className="small text-on-surface-variant font-mono">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="text-end text-primary fw-bold fs-4">
          {review.rating.toFixed(1)} <span className="fs-6 text-on-surface-variant fw-normal">/ 5.0</span>
        </div>
      </div>

      <h5 className="fw-bold mb-2">{review.title}</h5>
      <p className="text-on-surface">{review.comment}</p>

      {review.subScores && (
        <div className="review-subscores d-flex flex-wrap gap-2 mb-3 mt-3 p-3 bg-surface-container rounded-3">
          <div className="badge border border-secondary text-on-surface px-3 py-2">
            <span className="text-on-surface-variant small me-2">Style</span> 
            <span className="fw-bold text-primary">{review.subScores.style}/5</span>
          </div>
          <div className="badge border border-secondary text-on-surface px-3 py-2">
            <span className="text-on-surface-variant small me-2">Comfort</span> 
            <span className="fw-bold text-primary">{review.subScores.comfort}/5</span>
          </div>
          <div className="badge border border-secondary text-on-surface px-3 py-2">
            <span className="text-on-surface-variant small me-2">Fuel</span> 
            <span className="fw-bold text-primary">{review.subScores.fuelEconomy}/5</span>
          </div>
          <div className="badge border border-secondary text-on-surface px-3 py-2">
            <span className="text-on-surface-variant small me-2">Performance</span> 
            <span className="fw-bold text-primary">{review.subScores.performance}/5</span>
          </div>
          <div className="badge border border-secondary text-on-surface px-3 py-2">
            <span className="text-on-surface-variant small me-2">Value</span> 
            <span className="fw-bold text-primary">{review.subScores.valueMoney}/5</span>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end align-items-center border-top border-secondary pt-3 mt-3">
        <button 
          className={`btn btn-sm d-flex align-items-center gap-1 ${isHelpful ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => onHelpful && onHelpful(review._id)}
        >
          <span className="material-symbols-outlined icon-sm icon-inline" aria-hidden="true">thumb_up</span>
          Helpful ({review.helpful.length})
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
