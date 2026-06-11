import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { carService } from '../../services/carService';
import { supportService } from '../../services/supportService';
import { Car } from '../../types';
import CarCard from '../../components/CarCard/CarCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('saved');
  const [bookmarks, setBookmarks] = useState<Car[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [priceHistoryData, setPriceHistoryData] = useState<{ date: string; price: number }[]>([]);
  const [selectedCarForHistory, setSelectedCarForHistory] = useState<Car | null>(null);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchBookmarks();
    }
    if (activeTab === 'tickets' && supportTickets.length === 0) {
      fetchSupportTickets();
    }
  }, [activeTab, fetchBookmarks, fetchSupportTickets, supportTickets.length]);

  const handleRemoveBookmark = async (id: string) => {
    try {
      await carService.removeBookmark(id);
      setBookmarks(bookmarks.filter(car => car._id !== id));
      showToast('Car removed from bookmarks', 'info');
      if (selectedCarForHistory?._id === id) setSelectedCarForHistory(null);
    } catch {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const handleViewHistory = async (car: Car) => {
    try {
      const res = await carService.getCarPriceHistory(car._id);
      if (res.success) {
        const history = res.data.map((h: Record<string, unknown>) => ({
          date: new Date(h.date as string).toLocaleDateString(),
          price: h.newPrice as number
        }));
        
        // Add current price if there's no history
        if (history.length === 0) {
          history.push({
            date: new Date().toLocaleDateString(),
            price: car.price
          });
        }
        
        setPriceHistoryData(history);
        setSelectedCarForHistory(car);
      }
    } catch {
      showToast('Failed to load price history', 'error');
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile updated successfully!', 'success');
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
                <span className="material-symbols-outlined">directions_car</span> Inventory
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <span className="material-symbols-outlined">assessment</span> Reports
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                <span className="material-symbols-outlined">support_agent</span> Support Tickets
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <span className="material-symbols-outlined">analytics</span> Analytics
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="material-symbols-outlined">settings</span> Settings
              </button>
            </nav>

            <div className="mt-auto pt-4 border-top border-secondary d-flex flex-column gap-2">
              <Link to="/cars" className="text-decoration-none"><button className="btn btn-primary w-100 py-2 fw-bold active-glow">Generate Report</button></Link>
              <button className="dashboard-nav-link text-on-surface-variant hover:text-error mt-2" onClick={logout}>
                <span className="material-symbols-outlined">logout</span> Logout
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
                <div className="w-100 h-100 rounded-circle bg-primary text-on-primary d-flex align-items-center justify-content-center fs-2 fw-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="font-heading h3 m-0">{user?.name}</h2>
                <p className="font-mono text-primary text-uppercase m-0 mt-1" style={{ fontSize: '12px' }}>
                  {user?.role === 'admin' ? 'System Administrator' : 'Premium Member'}
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
                <span className="dashboard-stat-value">0</span>
              </div>
              <div className="d-flex flex-column">
                <span className="dashboard-stat-label">RANK</span>
                <span className="dashboard-stat-value text-tertiary">Gold</span>
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
                          onBookmark={() => handleRemoveBookmark(car._id)} 
                          isBookmarked={true} 
                        />
                        <button className="btn btn-sm btn-outline-primary w-100 mt-2" onClick={() => handleViewHistory(car)}>
                          <span className="material-symbols-outlined fs-6 align-middle me-1">trending_up</span>
                          View Price Trend
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-5 text-center rounded-4 border-secondary">
                    <h5 className="font-heading text-on-surface mb-2">No saved vehicles</h5>
                    <p className="text-on-surface-variant">Your tracked vehicles will appear here.</p>
                  </div>
                )}

                {selectedCarForHistory && (
                  <div className="glass-panel p-4 rounded-4 mt-4 fade-in-up">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="font-heading m-0">Price Trend: {selectedCarForHistory.year} {selectedCarForHistory.make} {selectedCarForHistory.model}</h4>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedCarForHistory(null)}>Close</button>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={priceHistoryData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                          <XAxis dataKey="date" stroke="var(--on-surface-variant)" />
                          <YAxis domain={['auto', 'auto']} stroke="var(--on-surface-variant)" tickFormatter={value => `$${value/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-container-highest)', borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                          />
                          <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'reports' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">Recent Reports</h3>
                <div className="glass-panel p-4 rounded-4">
                  <div className="text-center py-5 opacity-50">
                    <span className="material-symbols-outlined fs-1 mb-2">history_edu</span>
                    <p className="m-0">No reports generated yet.</p>
                  </div>
                </div>
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
                <h3 className="font-heading h4 m-0">Analytics & Reviews</h3>
                <div className="glass-panel p-4 rounded-4">
                  <div className="text-center py-5 opacity-50">
                    <span className="material-symbols-outlined fs-1 mb-2">analytics</span>
                    <p className="m-0">No reviews yet.</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="d-flex flex-column gap-3">
                <h3 className="font-heading h4 m-0">Security & Preferences</h3>
                <form className="glass-panel p-4 rounded-4 d-flex flex-column gap-4" onSubmit={handleUpdateProfile}>
                  <div className="row g-4">
                    <div className="col-md-6 d-flex flex-column gap-2">
                      <label className="font-mono text-on-surface-variant text-uppercase fw-bold" style={{ fontSize: '12px' }}>FULL NAME</label>
                      <input type="text" className="settings-input" defaultValue={user?.name} />
                    </div>
                    <div className="col-md-6 d-flex flex-column gap-2">
                      <label className="font-mono text-on-surface-variant text-uppercase fw-bold" style={{ fontSize: '12px' }}>EMAIL ADDRESS</label>
                      <input type="email" className="settings-input" defaultValue={user?.email} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <button type="button" className="btn btn-outline-secondary px-4">Discard</button>
                    <button type="submit" className="btn btn-primary px-4 active-glow">Update Protocol</button>
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
