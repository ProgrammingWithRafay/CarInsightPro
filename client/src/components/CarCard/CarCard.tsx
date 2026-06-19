import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../../types';
import { formatPriceRange } from '../../utils/formatPrice';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './CarCard.css';

interface CarCardProps {
  car: Car;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBookmark, isBookmarked = false }) => {
  /**
   * Handles clicks on the bookmark heart icon.
   * stopPropagation prevents the click from triggering the Link navigation wrapper,
   * allowing the user to bookmark without leaving the current page.
   */
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmark) onBookmark(car._id);
  };

  return (
    <Link to={`/cars/${car._id}`} className="text-decoration-none h-100 d-block car-card-wrapper">
      <div className="glass-panel car-card-stitch group">
        <div className="car-card-img-container">
          <OptimizedImage 
            src={car.images[0] || '/placeholder.png'} 
            alt={`${car.make} ${car.model}`} 
            className="car-card-img"
          />
          <button 
            className={`car-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? "Remove from saved" : "Save car"}
          >
            <span 
              className={`material-symbols-outlined icon-md ${isBookmarked ? 'icon-filled' : ''}`}
              aria-hidden="true"
            >
              favorite
            </span>
          </button>
        </div>
        
        <div className="car-card-content">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h4 className="car-card-title text-truncate">{car.year} {car.make} {car.model}</h4>
            <span className="car-card-price">{formatPriceRange(car.price, car.priceMax)}</span>
          </div>
          
          <div className="car-card-specs">
            <span className="car-card-spec-badge">{car.specs?.engine || 'N/A'}</span>
            <span className="car-card-spec-badge">{car.transmission || 'N/A'}</span>
            {car.specs?.horsepower && <span className="car-card-spec-badge">{car.specs.horsepower} HP</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(CarCard);
