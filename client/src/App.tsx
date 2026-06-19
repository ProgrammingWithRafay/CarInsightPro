import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';

import Skeleton from './components/Skeleton/Skeleton';

// Lazy-loaded Pages
const Home = React.lazy(() => import('./pages/Home/Home'));
const Cars = React.lazy(() => import('./pages/Cars/Cars'));
const CarDetail = React.lazy(() => import('./pages/CarDetail/CarDetail'));
const Compare = React.lazy(() => import('./pages/Compare/Compare'));
const CarQuiz = React.lazy(() => import('./pages/Quiz/CarQuiz'));
const EVHub = React.lazy(() => import('./pages/EVHub/EVHub'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Admin = React.lazy(() => import('./pages/Admin/Admin'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const VerifyEmail = React.lazy(() => import('./pages/Auth/VerifyEmail'));
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'));
const PrivacyPolicy = React.lazy(() => import('./pages/Static/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/Static/TermsOfService'));
const Contact = React.lazy(() => import('./pages/Static/Contact'));
const NotFound = React.lazy(() => import('./pages/NotFound/NotFound'));

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1" style={{ paddingTop: '1rem' }}>
              <React.Suspense fallback={
                <div className="container-fluid pt-5 mt-5">
                  <Skeleton height="60vh" className="rounded-4" />
                </div>
              }>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/cars" element={<Cars />} />
                  <Route path="/cars/:id" element={<CarDetail />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/ev-hub" element={<EVHub />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify/:token" element={<VerifyEmail />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute userOnly={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matchmaker"
                    element={
                      <ProtectedRoute userOnly={true}>
                        <CarQuiz />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
