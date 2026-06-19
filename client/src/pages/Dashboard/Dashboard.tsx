import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { carService } from '../../services/carService';
import { supportService } from '../../services/supportService';
import { reviewService } from '../../services/reviewService';
import { Car, Review } from '../../types';
import CarCard from '../../components/CarCard/CarCard';
import './Dashboard.css';

interface SupportTicket {
  _id: string;
  subject: string;
  status: string;
  createdAt: string;
  message: string;
  replies?: { isAdmin: boolean; createdAt: string; message: string }[];
}

const Dashboard: React.FC = () => {
  const { user, logout, updateProfile, evaluateRank } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('saved');
  const [bookmarks, setBookmarks] = useState<Car[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [reports, setReports] = useState<{id: string, carId: string, carName: string, date: string}[]>([]);

  /**
   * Fetches the user's bookmarked cars.
   * Wrapped in useCallback to safely include it in the dependency array of useEffect.
   */
  const fetchBookmarks = React.useCallback(async () => {
    setLoadingBookmarks(true);
    try {
      const res = await carService.getBookmarks();
      if (res.success) {
        setBookmarks(res.data as unknown as Car[]);
      }
    } catch {
      showToast('Failed to load saved cars', 'error');
    } finally {
      setLoadingBookmarks(false);
    }
  }, [showToast]);

  /**
   * Fetches the user's support tickets.
   */
  const fetchSupportTickets = React.useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await supportService.getMyMessages();
      if (res.success) {
        setSupportTickets(res.data);
      }
    } catch {
      showToast('Failed to load support tickets', 'error');
    } finally {
      setLoadingTickets(false);
    }
  }, [showToast]);

  /**
   * Fetches the user's previously submitted reviews.
   */
  const fetchMyReviews = React.useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await reviewService.getMyReviews();
      if (res.success) {
        setMyReviews(res.data);
      }
    } catch {
      showToast('Failed to load your reviews', 'error');
    } finally {
      setLoadingReviews(false);
    }
  }, [showToast]);

  /**
   * Tab-based Data Fetching Logic:
   * Instead of loading all data at once on mount, we lazy-load the data
   * based on which tab the user navigates to. This improves initial load performance.
   * We also check if the data array is empty before fetching to prevent redundant calls.
   */
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchBookmarks();
    }
    if (activeTab === 'tickets' && supportTickets.length === 0) {
      fetchSupportTickets();
    }
    if (activeTab === 'reviews' && myReviews.length === 0) {
      fetchMyReviews();
    }
  }, [activeTab, fetchBookmarks, fetchSupportTickets, fetchMyReviews, supportTickets.length, myReviews.length]);

  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem('carinsight_reports') || '[]');
    setReports(savedReports);
  }, [activeTab]); // Refresh reports when tab changes

  // Trigger permanent rank evaluation if metrics change
  useEffect(() => {
    if (evaluateRank && reports.length >= 0) {
      evaluateRank(reports.length);
    }
  }, [bookmarks.length, myReviews.length, reports.length, evaluateRank]);

  /**
   * Handles removing a car from the user's bookmarks.
   * Uses optimistic UI updating to immediately remove the car from the screen
   * before the API call finishes, providing a snappier user experience.
   */
  const handleRemoveBookmark = React.useCallback(async (id: string) => {
    try {
      // Optimistically update the UI immediately
      setBookmarks(prev => prev.filter(car => car._id !== id));
      await carService.removeBookmark(id);
      showToast('Car removed from bookmarks', 'info');
    } catch {
      // If it fails, we should ideally revert, but a page refresh will sync state
      showToast('Failed to remove bookmark', 'error');
    }
  }, [showToast]);

  const [profileLoading, setProfileLoading] = useState(false);
  
  const userRank = user?.rank || 'Bronze';

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return 'var(--on-surface-variant)';
    }
  };

  /**
   * Submits profile updates (name, email) to the backend.
   * Prevents default form submission, extracts values from the form elements,
   * and displays a toast notification upon success or failure.
   */
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const avatarInput = form.elements.namedItem('avatar') as HTMLInputElement;
    
    if (!nameInput.value || !emailInput.value) {
      return showToast('Name and email are required', 'error');
    }
    
    const avatarFile = avatarInput.files && avatarInput.files.length > 0 ? avatarInput.files[0] : undefined;
    
    setProfileLoading(true);
    try {
      if (updateProfile) {
        const res = await updateProfile(nameInput.value, emailInput.value, avatarFile);
        showToast(res.message || 'Profile updated successfully!', 'success');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="dashboard-page container-fluid max-w-container-max mx-auto px-3 px-md-4 py-5 mt-4">
      <div className="row g-4">
        
        {/* Sidebar Navigation */}
        <div className="col-lg-3">
          <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column gap-4">
            <div>
              <h1 className="font-heading h3 fw-bold text-primary mb-1">CarInsight Pro</h1>
              <p className="font-mono text-on-surface-variant text-uppercase" style={{ fontSize: '10px' }}>Precision Analytics</p>
            </div>
            
            <nav className="dashboard-sidebar-nav flex-grow-1">
              <button 
                className={`dashboard-nav-link ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">directions_car</span> Inventory
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">assessment</span> Reports
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">support_agent</span> Support Tickets
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">analytics</span> Analytics
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">settings</span> Settings
              </button>
            </nav>

            <div className="mt-auto pt-4 border-top border-secondary d-flex flex-column gap-2">
              <Link to="/cars" className="text-decoration-none"><button className="btn btn-primary w-100 py-2 fw-bold active-glow">Generate Report</button></Link>
              <button className="dashboard-nav-link text-on-surface-variant hover:text-error mt-2" onClick={logout}>
                <span className="material-symbols-outlined icon-md icon-inline me-2" aria-hidden="true">logout</span> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9 d-flex flex-column gap-4">
          
          {/* Profile Header */}
          <header className="glass-panel p-4 rounded-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
            <div className="d-flex align-items-center gap-4">
              <div className="rounded-circle border border-2 border-primary p-1" style={{ width: '80px', height: '80px' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-100 h-100 rounded-circle object-fit-cover" />
                ) : (
                  <div className="w-100 h-100 rounded-circle bg-primary text-on-primary d-flex align-items-center justify-content-center fs-2 fw-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-heading h3 m-0">{user?.name}</h2>
                <p className="font-mono text-primary text-uppercase m-0 mt-1" style={{ fontSize: '12px' }}>
                  {user?.role === 'admin' ? 'System Administrator' : 'Member'}
                </p>
              </div>
            </div>

            <div className="d-flex gap-4">
              <div className="d-flex flex-column">
                <span className="dashboard-stat-label">CARS SAVED</span>
                <span className="dashboard-stat-value">{user?.bookmarks?.length || 0}</span>
              </div>
              <div className="d-flex flex-column">
                <span className="dashboard-stat-label">REPORTS</span>
                <span className="dashboard-stat-value">{reports.length}</span>
              </div>
              <div className="d-flex flex-column">
                <span className="dashboard-stat-label">RANK</span>
                <span className="dashboard-stat-value fw-bold" style={{ color: getRankColor(userRank), textShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                  {userRank}
                </span>
              </div>
            </div>
          </header>

          {/* Dynamic Tab Content */}
          <div className="fade-in-up flex-grow-1">
            {activeTab === 'saved' && (
              <section className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <h3 className="font-heading h4 m-0">Saved Vehicles</h3>
                </div>
                {loadingBookmarks ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : bookmarks.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {bookmarks.map(car => (
                      <div className="col" key={car._id}>
                        <CarCard 
                          car={car} 
                          onBookmark={handleRemoveBookmark} 
                          isBookmarked={true} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-5 text-center rounded-4 border-secondary">
                    <h5 className="font-heading text-on-surface mb-2">No saved vehicles</h5>
                    <p className="text-on-surface-variant">Your tracked vehicles will appear here.</p>
                  </div>
                )}

              </section>
            )}

            {activeTab === 'reports' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">Recent Reports</h3>
                {reports.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {reports.map(report => (
                      <div key={report.id} className="glass-panel p-4 rounded-4 d-flex justify-content-between align-items-center">
                        <div>
                          <h4 className="font-heading h5 mb-1">{report.carName}</h4>
                          <span className="text-on-surface-variant small">Generated on {new Date(report.date).toLocaleString()}</span>
                        </div>
                        <Link to={`/cars/${report.carId}`} className="btn btn-sm btn-outline-primary">
                          View Vehicle
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-4 rounded-4">
                    <div className="text-center py-5 opacity-50">
                      <span className="material-symbols-outlined icon-hero mb-2 opacity-50" aria-hidden="true">history_edu</span>
                      <p className="m-0">No reports generated yet.</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'tickets' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">My Support Tickets</h3>
                {loadingTickets ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : supportTickets.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {supportTickets.map(ticket => (
                      <div key={ticket._id} className="glass-panel p-4 rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h4 className="font-heading h5 m-0">{ticket.subject}</h4>
                          <span className={`badge bg-opacity-25 border ${ticket.status === 'Open' ? 'bg-error text-error border-error' : ticket.status === 'Acknowledged' ? 'bg-primary text-primary border-primary' : 'bg-success text-success border-success'}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-on-surface-variant small mb-3">
                          Submitted on {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                        <div className="bg-surface-container p-3 rounded mb-3">
                          {ticket.message}
                        </div>
                        
                        {ticket.replies && ticket.replies.length > 0 && (
                          <div className="mt-4 pt-3 border-top border-secondary">
                            <h5 className="font-heading h6 mb-3">Replies</h5>
                            <div className="d-flex flex-column gap-2">
                              {ticket.replies.map((reply, idx: number) => (
                                <div key={idx} className={`p-3 rounded ${reply.isAdmin ? 'bg-surface-container border border-primary' : 'bg-surface-container border border-secondary'}`}>
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="fw-bold small">{reply.isAdmin ? 'Support Team' : 'You'}</span>
                                    <span className="text-on-surface-variant small">{new Date(reply.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="text-on-surface" style={{ whiteSpace: 'pre-wrap' }}>{reply.message}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-5 text-center rounded-4 border-secondary">
                    <h5 className="font-heading text-on-surface mb-2">No support tickets</h5>
                    <p className="text-on-surface-variant">If you need help, contact support.</p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">My Analytics & Reviews</h3>
                {loadingReviews ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : myReviews.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {myReviews.map((review: Review) => (
                      <div key={review._id} className="glass-panel p-4 rounded-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-3">
                            {(review.car as Car)?.images?.[0] ? (
                              <img src={(review.car as Car).images[0]} alt="car" width="60" height="40" className="rounded object-fit-cover" />
                            ) : (
                              <div className="bg-secondary rounded d-flex align-items-center justify-content-center" style={{ width: 60, height: 40 }}>
                                <span className="material-symbols-outlined icon-md text-white" aria-hidden="true">directions_car</span>
                              </div>
                            )}
                            <div>
                              <h4 className="font-heading h5 m-0 mb-1">
                                {(review.car as Car) ? `${(review.car as Car).year} ${(review.car as Car).make} ${(review.car as Car).model}` : 'Deleted Car'}
                              </h4>
                              <div className="d-flex align-items-center gap-1">
                                <span className="material-symbols-outlined icon-sm text-tertiary icon-filled" aria-hidden="true">star</span>
                                <span className="fw-bold">{(review.rating).toFixed(1)}</span>
                                <span className="text-on-surface-variant small ms-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          {(review.car as Car)?._id && (
                            <Link to={`/cars/${(review.car as Car)?._id}`} className="btn btn-sm btn-outline-secondary">View Car</Link>
                          )}
                        </div>
                        <h5 className="h6 fw-bold mb-2">{review.title}</h5>
                        <p className="text-on-surface mb-0">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-4 rounded-4">
                    <div className="text-center py-5 opacity-50">
                      <span className="material-symbols-outlined icon-hero mb-2 opacity-50" aria-hidden="true">analytics</span>
                      <p className="m-0">You haven't logged any reviews yet.</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">Security & Preferences</h3>
                <form className="glass-panel p-4 rounded-4 d-flex flex-column gap-4" onSubmit={handleUpdateProfile}>
                  <div className="row g-4">
                    <div className="col-md-6 d-flex flex-column gap-2">
                      <label className="font-mono text-on-surface-variant text-uppercase fw-bold" style={{ fontSize: '12px' }}>FULL NAME</label>
                      <input type="text" name="name" className="settings-input" defaultValue={user?.name} required />
                    </div>
                    <div className="col-md-6 d-flex flex-column gap-2">
                      <label className="font-mono text-on-surface-variant text-uppercase fw-bold" style={{ fontSize: '12px' }}>EMAIL ADDRESS</label>
                      <input type="email" name="email" className="settings-input" defaultValue={user?.email} required />
                    </div>
                    <div className="col-12 d-flex flex-column gap-2">
                      <label className="font-mono text-on-surface-variant text-uppercase fw-bold" style={{ fontSize: '12px' }}>PROFILE PICTURE</label>
                      <input type="file" name="avatar" className="settings-input form-control bg-transparent text-on-surface" accept="image/*" />
                      <small className="text-on-surface-variant">Upload an image to customize your profile avatar.</small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <button type="button" className="btn btn-outline-secondary px-4">Discard</button>
                    <button type="submit" className="btn btn-primary px-4 active-glow" disabled={profileLoading}>
                      {profileLoading ? 'Updating...' : 'Update Protocol'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
