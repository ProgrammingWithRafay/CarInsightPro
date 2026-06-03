import React, { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className={`star-rating ${interactive ? 'interactive' : ''}`} onMouseLeave={() => interactive && setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fillPercentage = Math.max(0, Math.min(100, (currentRating - index + 1) * 100));
        
        return (
          <div 
            key={index} 
            className="star-container"
            onClick={() => handleClick(index)}
            onMouseEnter={() => interactive && setHoverRating(index)}
          >
            {/* Background Star (Empty) */}
            <svg viewBox="0 0 24 24" className="star empty">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            
            {/* Foreground Star (Filled) */}
            <div className="star-fill" style={{ width: `${fillPercentage}%` }}>
              <svg viewBox="0 0 24 24" className="star filled">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
