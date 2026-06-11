import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car, FilterState, ApiResponse } from '../../types';
import CarCard from '../../components/CarCard/CarCard';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import axios from 'axios';
import './Cars.css';

const Cars: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [carsData, setCarsData] = useState<ApiResponse<Car[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Read initial filter state from URL params (so back button restores page)
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') ? searchParams.get('brand')!.split(',') : [],
    yearMin: searchParams.get('yearMin') ? Number(searchParams.get('yearMin')) : '',
    yearMax: searchParams.get('yearMax') ? Number(searchParams.get('yearMax')) : '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
    fuelType: searchParams.get('fuelType') ? searchParams.get('fuelType')!.split(',') : [],
    transmission: searchParams.get('transmission') || '',
    sortBy: searchParams.get('sortBy') || 'price-asc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1
  }));

  const debouncedSearch = useDebounce(filters.search, 500);

  // Sync filters to URL search params whenever they change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.page > 1) params.page = String(filters.page);
    if (filters.search) params.search = filters.search;
    if (filters.brand.length > 0) params.brand = filters.brand.join(',');
    if (filters.yearMin) params.yearMin = String(filters.yearMin);
    if (filters.yearMax) params.yearMax = String(filters.yearMax);
    if (filters.priceMin) params.priceMin = String(filters.priceMin);
    if (filters.priceMax) params.priceMax = String(filters.priceMax);
    if (filters.fuelType.length > 0) params.fuelType = filters.fuelType.join(',');
    if (filters.transmission) params.transmission = filters.transmission;
    if (filters.sortBy && filters.sortBy !== 'price-asc') params.sortBy = filters.sortBy;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch user's bookmarks on mount
  useEffect(() => {
    if (isAuthenticated) {
      carService.getBookmarks().then(res => {
        if (res.success && Array.isArray(res.data)) {
          setBookmarkedIds(res.data.map((b: string | { _id: string }) => typeof b === 'string' ? b : b._id));
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const toggleBookmark = async (carId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save cars', 'error');
      return;
    }
    try {
      if (bookmarkedIds.includes(carId)) {
        await carService.removeBookmark(carId);
        setBookmarkedIds(prev => prev.filter(id => id !== carId));
        showToast('Removed from saved cars', 'info');
      } else {
        await carService.addBookmark(carId);
        setBookmarkedIds(prev => [...prev, carId]);
        showToast('Saved to dashboard', 'success');
      }
    } catch {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const fetchCars = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = { ...filters, search: debouncedSearch };
      const res = await carService.getCars(activeFilters);
      if (res.success) {
        setCarsData(res);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch cars');
      } else {
        setError('Failed to fetch cars');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      
      {/* Header */}
      <header className="cars-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <h1 className="font-heading cars-page-title">Market Inventory</h1>
          <p className="cars-data-points m-0">
            <span className="font-mono text-primary me-2">{carsData?.pagination?.total || 0}</span>
            Active Data Points
          </p>
        </div>
        <div className="d-flex align-items-center gap-3 w-100" style={{ maxWidth: '300px' }}>
          <span className="sort-label">SORT BY</span>
          <select 
            className="sort-select flex-grow-1"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }))}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Newest First</option>
            <option value="year-asc">Oldest First</option>
          </select>
        </div>
      </header>

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        {/* Main Grid */}
        <div className="col-12 col-lg-9">
          {error && <div className="alert alert-danger border-error bg-error-container text-on-error-container">{error}</div>}
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="col">
                  <div className="glass-panel rounded-4 h-100 p-0 overflow-hidden">
                    <Skeleton height="200px" width="100%" className="rounded-0" />
                    <div className="p-3">
                      <Skeleton height="24px" width="80%" className="mb-2" />
                      <Skeleton height="20px" width="40%" />
                    </div>
                  </div>
                </div>
              ))
            ) : carsData && carsData.data.length > 0 ? (
              carsData.data.map((car: Car) => (
                <div key={car._id} className="col">
                  <CarCard 
                    car={car} 
                    onBookmark={() => toggleBookmark(car._id)}
                    isBookmarked={bookmarkedIds.includes(car._id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="opacity-50 mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
                </div>
                <h4 className="font-heading text-on-surface">No vehicles match your telemetry</h4>
                <p className="text-on-surface-variant">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && carsData && carsData.pagination && carsData.pagination.pages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button 
                className="pagination-btn"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page! - 1)}
              >
                <span className="material-symbols-outlined fs-6">chevron_left</span>
              </button>
              
              {[...Array(carsData.pagination.pages)].map((_, i) => (
                <button 
                  key={i + 1}
                  className={`pagination-btn ${filters.page === i + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                className="pagination-btn"
                disabled={filters.page === carsData.pagination.pages}
                onClick={() => handlePageChange(filters.page! + 1)}
              >
                <span className="material-symbols-outlined fs-6">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Cars;
