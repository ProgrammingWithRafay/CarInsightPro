import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../../types';
import './CarCard.css';

interface CarCardProps {
  car: Car;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBookmark, isBookmarked = false }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBookmark) onBookmark();
  };

  return (
    <Link to={`/cars/${car._id}`} className="text-decoration-none h-100 d-block">
      <div className="glass-panel car-card-stitch group">
        <div className="car-card-img-container">
          <img 
            src={car.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
            alt={`${car.make} ${car.model}`} 
            className="car-card-img"
          />
          <button 
            className={`car-card-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? "Remove from saved" : "Save car"}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
        
        <div className="car-card-content">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h4 className="car-card-title text-truncate">{car.year} {car.make} {car.model}</h4>
            <span className="car-card-price">${car.price.toLocaleString()}</span>
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

export default CarCard;
