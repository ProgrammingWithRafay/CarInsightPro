import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { supportService } from '../../services/supportService';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { AdminStats, User, Car } from '../../types';
import Modal from '../../components/Modal/Modal';
import AdminCarForm from './AdminCarForm';
import { formatPriceRange } from '../../utils/formatPrice';
import './Admin.css';

interface SupportMessage {
  _id: string;
  name?: string;
  email?: string;
  user?: { name: string; email: string };
  subject: string;
  message: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  replies?: { isAdmin: boolean; message: string; createdAt: string }[];
}

const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [adminCars, setAdminCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [carsLoading, setCarsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadCars = React.useCallback(async () => {
    setCarsLoading(true);
    try {
      const res = await api.get('/cars?limit=100');
      if (res.data.success) setAdminCars(res.data.data);
    } catch {
      showToast('Failed to load vehicles', 'error');
    } finally {
      setCarsLoading(false);
    }
  }, [showToast]);

  const loadSupportMessages = React.useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await supportService.getAdminMessages();
      if (res.success) setSupportMessages(res.data);
    } catch {
      showToast('Failed to load support messages', 'error');
    } finally {
      setMessagesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers()
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (usersRes.success) setUsers(usersRes.data);
      } catch {
        showToast('Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'cars' && adminCars.length === 0) {
      loadCars();
    }
    if (activeTab === 'support' && supportMessages.length === 0) {
      loadSupportMessages();
    }
  }, [activeTab, adminCars.length, supportMessages.length, loadCars, loadSupportMessages]);

  const handleUpdateMessageStatus = async (id: string, status: 'Open' | 'Acknowledged' | 'Resolved') => {
    try {
      await supportService.updateMessageStatus(id, status);
      setSupportMessages(supportMessages.map(m => m._id === id ? { ...m, status } : m));
      if (viewingMessage && viewingMessage._id === id) {
        setViewingMessage({ ...viewingMessage, status });
      }
      showToast(`Ticket status updated to ${status}`, 'success');
    } catch {
      showToast('Failed to update ticket status', 'error');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    
    try {
      await supportService.deleteTicket(id);
      setSupportMessages(supportMessages.filter(m => m._id !== id));
      if (viewingMessage && viewingMessage._id === id) {
        setIsMessageModalOpen(false);
      }
      showToast('Ticket deleted permanently', 'success');
    } catch {
      showToast('Failed to delete ticket', 'error');
    }
  };

  const handleOpenMessageModal = (msg: SupportMessage) => {
    setViewingMessage(msg);
    setReplyText('');
    setIsMessageModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !viewingMessage) return;

    try {
      const res = await supportService.replyToMessage(viewingMessage._id, replyText, 'Acknowledged');
      if (res.success) {
        setViewingMessage(res.data);
        setSupportMessages(supportMessages.map(m => m._id === res.data._id ? res.data : m));
        setReplyText('');
        showToast('Reply sent successfully', 'success');
      }
    } catch {
      showToast('Failed to send reply', 'error');
    }
  };

  const handleToggleBlock = async (id: string) => {
    try {
      await adminService.toggleBlockUser(id);
      setUsers(users.map(u => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u));
      showToast('User status updated', 'success');
    } catch {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;
    
    try {
      await adminService.deleteCar(id);
      setAdminCars(adminCars.filter(c => c._id !== id));
      showToast('Vehicle deleted permanently', 'success');
    } catch {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCar(null);
    setIsCarModalOpen(true);
  };

  const handleOpenEditModal = (car: Car) => {
    setEditingCar(car);
    setIsCarModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCarModalOpen(false);
    loadCars();
  };



  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 py-5 mt-4">
      <div className="row g-4">
        
        {/* Sidebar Navigation */}
        <div className="col-lg-3">
          <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column gap-4">
            <div>
              <h1 className="font-heading h3 fw-bold text-primary mb-1">System Control</h1>
              <p className="font-mono text-on-surface-variant text-uppercase" style={{ fontSize: '10px' }}>Enterprise Admin</p>
            </div>
            
            <nav className="dashboard-sidebar-nav flex-grow-1">
              <button 
                className={`dashboard-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="material-symbols-outlined">query_stats</span> Telemetry
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="material-symbols-outlined">group</span> User Directory
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'cars' ? 'active' : ''}`}
                onClick={() => setActiveTab('cars')}
              >
                <span className="material-symbols-outlined">directions_car</span> Vehicle DB
              </button>
              <button 
                className={`dashboard-nav-link ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                <span className="material-symbols-outlined">support_agent</span> Support Tickets
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9 d-flex flex-column gap-4">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div className="fade-in-up">
              <div className="mb-4">
                <h2 className="font-heading m-0">Dashboard Overview</h2>
              </div>
              
              <div className="row g-4 mb-4">
                {[
                  { title: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'primary' },
                  { title: 'Total Cars', value: stats.totalCars, icon: 'directions_car', color: 'secondary' },
                  { title: 'Total Reviews', value: stats.totalReviews, icon: 'analytics', color: 'tertiary' },
                  { title: 'Support Tickets', value: stats.totalTickets, icon: 'support_agent', color: 'primary' }
                ].map((stat, i) => (
                  <div className="col-sm-6 col-lg-3" key={i}>
                    <div className="admin-stat-card-stitch h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className={`admin-stat-icon-wrapper bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                          <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                      </div>
                      <h3 className="mb-1 font-heading display-6 fw-bold">{stat.value}</h3>
                      <span className="text-on-surface-variant font-mono text-uppercase" style={{ fontSize: '10px' }}>{stat.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="fade-in-up">
              <h2 className="font-heading mb-4">Access Management</h2>
              <div className="glass-panel overflow-hidden rounded-4">
                <div className="table-responsive no-scrollbar">
                  <table className="admin-table-stitch">
                    <thead>
                      <tr>
                        <th>Operator</th>
                        <th>Clearance</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-primary bg-opacity-25 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{user.name}</h6>
                                <small className="text-on-surface-variant font-mono">{user.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-opacity-25 border ${user.role === 'admin' ? 'bg-primary text-primary border-primary' : 'bg-secondary text-secondary border-secondary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-opacity-25 border ${user.isBlocked ? 'bg-error text-error border-error' : 'bg-success text-success border-success'}`}>
                              {user.isBlocked ? 'Locked' : 'Active'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button 
                              className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-outline-danger'}`}
                              onClick={() => handleToggleBlock(user._id)}
                              disabled={user.role === 'admin'}
                            >
                              {user.isBlocked ? 'Unlock' : 'Lock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CARS TAB */}
          {activeTab === 'cars' && (
            <div className="fade-in-up">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="font-heading m-0">Vehicle Database Management</h2>
                <button className="btn btn-primary d-flex align-items-center gap-2 active-glow" onClick={handleOpenAddModal}>
                  <span className="material-symbols-outlined fs-5">add</span> Add Vehicle
                </button>
              </div>

              <div className="glass-panel overflow-hidden rounded-4">
                {carsLoading ? (
                  <div className="p-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <div className="table-responsive no-scrollbar">
                    <table className="admin-table-stitch">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Make / Model</th>
                          <th>Year</th>
                          <th>Price</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminCars.map(car => (
                          <tr key={car._id}>
                            <td>
                              <img 
                                src={car.images[0] || 'https://via.placeholder.com/80x50'} 
                                alt={car.model} 
                                className="rounded object-fit-cover border border-secondary"
                                style={{ width: '80px', height: '50px' }}
                              />
                            </td>
                            <td>
                              <h6 className="mb-0 fw-bold">{car.make}</h6>
                              <small className="text-on-surface-variant">{car.model}</small>
                            </td>
                            <td>{car.year}</td>
                            <td className="font-mono text-success">{formatPriceRange(car.price, car.priceMax)}</td>
                            <td className="text-end">
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleOpenEditModal(car)}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteCar(car._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {adminCars.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center p-4 text-on-surface-variant">No vehicles found. Add one above.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUPPORT TICKETS TAB */}
          {activeTab === 'support' && (
            <div className="fade-in-up">
              <h2 className="font-heading mb-4">Support Tickets</h2>
              <div className="glass-panel overflow-hidden rounded-4">
                {messagesLoading ? (
                  <div className="p-5 text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <div className="table-responsive no-scrollbar">
                    <table className="admin-table-stitch">
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportMessages.map(msg => (
                          <tr key={msg._id}>
                            <td>
                              <h6 className="mb-0 fw-bold">{msg.user ? msg.user.name : msg.name}</h6>
                              <small className="text-on-surface-variant font-mono">{msg.user ? msg.user.email : msg.email} {msg.user ? '' : '(Guest)'}</small>
                            </td>
                            <td>{msg.subject}</td>
                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={msg.message}>
                              {msg.message}
                            </td>
                            <td>
                              <span className={`badge bg-opacity-25 border ${msg.status === 'Open' ? 'bg-error text-error border-error' : msg.status === 'Acknowledged' ? 'bg-primary text-primary border-primary' : 'bg-success text-success border-success'}`}>
                                {msg.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleOpenMessageModal(msg)}>View</button>
                              {msg.status !== 'Acknowledged' && msg.status !== 'Resolved' && (
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleUpdateMessageStatus(msg._id, 'Acknowledged')}>Ack</button>
                              )}
                              {msg.status !== 'Resolved' && (
                                <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleUpdateMessageStatus(msg._id, 'Resolved')}>Resolve</button>
                              )}
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTicket(msg._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                        {supportMessages.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center p-4 text-on-surface-variant">No support tickets found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Car Form Modal */}
      <Modal isOpen={isCarModalOpen} onClose={() => setIsCarModalOpen(false)} title={editingCar ? "Edit Vehicle" : "Add Vehicle Entry"} size="lg">
        <AdminCarForm 
          car={editingCar} 
          onSuccess={handleFormSuccess} 
          onCancel={() => setIsCarModalOpen(false)} 
        />
      </Modal>

      {/* View Message Modal */}
      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title="Support Ticket Details">
        {viewingMessage && (
          <div className="d-flex flex-column gap-3">
            <div>
              <span className="font-mono small text-uppercase text-on-surface-variant d-block mb-1">Sender</span>
              <div className="fw-bold fs-5">{viewingMessage.user ? viewingMessage.user.name : viewingMessage.name}</div>
              <div className="text-primary">{viewingMessage.user ? viewingMessage.user.email : viewingMessage.email} {viewingMessage.user ? '' : '(Guest)'}</div>
            </div>
            <hr className="border-secondary my-1" />
            <div>
              <span className="font-mono small text-uppercase text-on-surface-variant d-block mb-1">Subject</span>
              <div className="fw-bold">{viewingMessage.subject}</div>
            </div>
            <div>
              <span className="font-mono small text-uppercase text-on-surface-variant d-block mb-1">Message</span>
              <div className="bg-surface-container p-3 rounded text-on-surface" style={{ whiteSpace: 'pre-wrap' }}>
                {viewingMessage.message}
              </div>
            </div>

            {viewingMessage.replies && viewingMessage.replies.length > 0 && (
              <div className="mt-3">
                <span className="font-mono small text-uppercase text-on-surface-variant d-block mb-2">Replies</span>
                <div className="d-flex flex-column gap-2">
                  {viewingMessage.replies?.map((reply, i: number) => (
                    <div key={i} className={`p-3 rounded ${reply.isAdmin ? 'bg-surface-container border border-primary' : 'bg-surface-container border border-secondary'}`}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-bold small">{reply.isAdmin ? 'Admin Support' : 'User'}</span>
                        <span className="text-on-surface-variant small">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-on-surface" style={{ whiteSpace: 'pre-wrap' }}>{reply.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!(viewingMessage.replies && viewingMessage.replies.length > 0) && (
              <form onSubmit={handleReplySubmit} className="mt-3">
                <label className="font-mono small text-uppercase text-on-surface-variant mb-1">Send a Reply</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder="Type your reply here..." 
                  required 
                />
                <button type="submit" className="btn btn-primary mt-2">Send Reply & Acknowledge</button>
              </form>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
              <div>
                <span className="font-mono small text-uppercase text-on-surface-variant me-2">Status:</span>
                <span className={`badge bg-opacity-25 border ${viewingMessage.status === 'Open' ? 'bg-error text-error border-error' : viewingMessage.status === 'Acknowledged' ? 'bg-primary text-primary border-primary' : 'bg-success text-success border-success'}`}>
                  {viewingMessage.status}
                </span>
              </div>
              <div className="d-flex gap-2">
                {viewingMessage.status !== 'Acknowledged' && viewingMessage.status !== 'Resolved' && (
                  <button className="btn btn-outline-primary" onClick={() => handleUpdateMessageStatus(viewingMessage._id, 'Acknowledged')}>Acknowledge</button>
                )}
                {viewingMessage.status !== 'Resolved' && (
                  <button className="btn btn-outline-success" onClick={() => handleUpdateMessageStatus(viewingMessage._id, 'Resolved')}>Resolve</button>
                )}
                <button className="btn btn-outline-danger" onClick={() => handleDeleteTicket(viewingMessage._id)}>Delete</button>
                <button className="btn btn-outline-secondary" onClick={() => setIsMessageModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
