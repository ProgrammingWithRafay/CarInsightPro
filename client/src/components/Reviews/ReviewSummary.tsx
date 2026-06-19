import React from 'react';
import { SubScores } from '../../types';
import './Reviews.css';

interface ReviewSummaryProps {
  aggregatedSubScores?: SubScores;
  totalReviews: number;
  averageRating: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ aggregatedSubScores, totalReviews, averageRating }) => {
  if (totalReviews === 0) {
    return (
      <div className="review-summary glass-panel p-4 rounded-4 text-center">
        <h4 className="font-heading">No reviews yet</h4>
        <p className="text-on-surface-variant">Be the first to share your experience with this vehicle.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-symbols-outlined icon-md ${i <= rating ? 'text-warning icon-filled' : 'text-on-surface-variant'}`} aria-hidden="true">
          star
        </span>
      );
    }
    return stars;
  };

  const getPercentage = (score: number) => `${(score / 5) * 100}%`;

  return (
    <div className="review-summary glass-panel p-4 rounded-4">
      <div className="row g-4 align-items-center">
        <div className="col-md-4 text-center border-end border-secondary border-opacity-50">
          <h2 className="display-3 font-heading text-primary fw-bold mb-0">{averageRating.toFixed(1)}</h2>
          <div className="d-flex justify-content-center my-2">
            {renderStars(averageRating)}
          </div>
          <p className="text-on-surface-variant m-0">{totalReviews} structured reviews</p>
        </div>
        <div className="col-md-8">
          <h4 className="font-heading mb-3">Category Breakdown</h4>
          {aggregatedSubScores && (
            <div className="d-flex flex-column gap-3">
              {[
                { label: 'Style', value: aggregatedSubScores.style },
                { label: 'Comfort', value: aggregatedSubScores.comfort },
                { label: 'Fuel Economy', value: aggregatedSubScores.fuelEconomy },
                { label: 'Performance', value: aggregatedSubScores.performance },
                { label: 'Value for Money', value: aggregatedSubScores.valueMoney }
              ].map(sub => (
                <div key={sub.label} className="d-flex align-items-center gap-3">
                  <span className="font-mono text-uppercase small" style={{ width: '130px' }}>{sub.label}</span>
                  <div className="progress flex-grow-1" style={{ height: '6px', backgroundColor: 'var(--surface-container-high)' }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: getPercentage(sub.value) }}></div>
                  </div>
                  <span className="font-mono text-primary fw-bold" style={{ width: '30px' }}>{sub.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
