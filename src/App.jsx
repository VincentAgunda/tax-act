import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CircularProgress, Box } from '@mui/material';
import PageTransition, { HolographicLoader } from './components/PageTransition';

// Lazy load heavy components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const ActViewer = React.lazy(() => import('./pages/ActViewer'));
const NewsFeed = React.lazy(() => import('./pages/NewsFeed'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Enhanced loading fallback with holographic effect
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="400px"
    sx={{ py: 4 }}
  >
    <HolographicLoader size={60} />
  </Box>
);

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/act/:id" element={
          <PageTransition>
            <ActViewer />
          </PageTransition>
        } />
        <Route path="/news" element={
          <PageTransition>
            <NewsFeed />
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <Register />
          </PageTransition>
        } />
        <Route 
          path="/admin" 
          element={
            <PageTransition>
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <Header />
          <main className="flex-grow relative overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <AnimatedRoutes />
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
