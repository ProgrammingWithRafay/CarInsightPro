import React, { useState, useEffect } from 'react';
import { FilterState } from '../../types';
import './FilterSidebar.css';
import axios from 'axios';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);

  // Fetch brands & fuel types from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cars/filter-options`);
        if (res.data.success) {
          setBrands(res.data.data.brands || []);
          setFuelTypes(res.data.data.fuelTypes || []);
        }
      } catch {
        // Fallback if API fails
        setBrands([]);
        setFuelTypes(['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Petrol & Hybrid']);
      }
    };
    fetchOptions();
  }, []);

  const handleReset = () => {
    setFilters({
      search: '',
      brand: [],
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      fuelType: [],
      transmission: '',
      sortBy: 'price-asc',
      page: 1
    });
  };

  const handleBrandChange = (brand: string) => {
    setFilters(prev => {
      const isSelected = prev.brand?.includes(brand);
      const newBrands = isSelected 
        ? prev.brand?.filter(b => b !== brand) 
        : [...(prev.brand || []), brand];
      return { ...prev, brand: newBrands };
    });
  };

  const handleFuelChange = (fuel: string) => {
    setFilters(prev => {
      const isSelected = prev.fuelType?.includes(fuel);
      const newFuels = isSelected 
        ? prev.fuelType?.filter(f => f !== fuel) 
        : [...(prev.fuelType || []), fuel];
      return { ...prev, fuelType: newFuels };
    });
  };

  return (
    <div className="glass-panel p-4 filter-sidebar-stitch d-flex flex-column gap-4 w-100">
      
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="filter-header">Filters</h3>
        <button onClick={handleReset} className="filter-reset-btn">Reset</button>
      </div>

      {/* Search */}
      <div className="position-relative">
        <span className="material-symbols-outlined filter-search-icon">search</span>
        <input 
          className="filter-search-input" 
          placeholder="Search models..." 
          type="text"
          value={filters.search || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>

      {/* Brand */}
      <div className="d-flex flex-column gap-2">
        <h4 className="filter-section-title">BRAND</h4>
        <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {brands.length > 0 ? brands.map(brand => (
            <label key={brand} className="filter-checkbox-label">
              <input 
                className="filter-checkbox" 
                type="checkbox"
                checked={filters.brand?.includes(brand) || false}
                onChange={() => handleBrandChange(brand)}
              />
              <span>{brand}</span>
            </label>
          )) : (
            <span className="text-on-surface-variant small">Loading...</span>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="d-flex flex-column gap-2">
        <h4 className="filter-section-title">PRICE RANGE</h4>
        <div className="filter-range-wrapper">
          <input 
            type="number" 
            className="filter-range-input" 
            placeholder="Min PKR"
            value={filters.priceMin || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : '' }))}
          />
          <span className="text-on-surface-variant">-</span>
          <input 
            type="number" 
            className="filter-range-input" 
            placeholder="Max PKR"
            value={filters.priceMax || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : '' }))}
          />
        </div>
      </div>

      {/* Fuel Type */}
      <div className="d-flex flex-column gap-2">
        <h4 className="filter-section-title">FUEL TYPE</h4>
        <div className="d-flex flex-column gap-2">
          {fuelTypes.length > 0 ? fuelTypes.map(fuel => (
            <label key={fuel} className="filter-checkbox-label">
              <input 
                className="filter-checkbox" 
                type="checkbox"
                checked={filters.fuelType?.includes(fuel) || false}
                onChange={() => handleFuelChange(fuel)}
              />
              <span>{fuel}</span>
            </label>
          )) : (
            <span className="text-on-surface-variant small">Loading...</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default FilterSidebar;
