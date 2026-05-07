import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Public pages
import Landing from './pages/Landing/Landing';
import AvailableTrips from './pages/Trips/AvailableTrips';
import FeaturesPage from './pages/Landing/FeaturesPage';
import HowItWorksPage from './pages/Landing/HowItWorksPage';
import ReviewsPage from './pages/Landing/ReviewsPage';
import ContactPage from './pages/Landing/ContactPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin pages
import Dashboard from './pages/Dashboard/Dashboard';
import Vehicles from './pages/Vehicles/Vehicles';
import Drivers from './pages/Drivers/Drivers';
import Trips from './pages/Trips/Trips';
import Maintenance from './pages/Maintenance/Maintenance';
import Fuel from './pages/Fuel/Fuel';
import Payments from './pages/Payments/Payments';
import Reports from './pages/Reports/Reports';
import Users from './pages/Admin/Admin';

// Driver pages
import DriverDashboard from './pages/Dashboard/DriverDashboard';
import DriverMyTrips from './pages/Drivers/DriverMyTrips';
import DriverAssigned from './pages/Drivers/DriverAssigned';
import DriverIncidents from './pages/Drivers/DriverIncidents';
import DriverProfile from './pages/Drivers/DriverProfile';

// Customer pages
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';

import BookTrip from './pages/Trips/BookTrip';
import './styles/global.css';

// Layout wrapper with sidebar + navbar for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

// Admin routes
const AdminRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="vehicles" element={<Vehicles />} />
      <Route path="drivers" element={<Drivers />} />
      <Route path="trips" element={<Trips />} />
      <Route path="maintenance" element={<Maintenance />} />
      <Route path="fuel" element={<Fuel />} />
      <Route path="payments" element={<Payments />} />
      <Route path="reports" element={<Reports />} />
      <Route path="users" element={<Users />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </AppLayout>
);

// Driver routes - each sidebar menu has its own page
const DriverRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="dashboard" element={<DriverDashboard />} />
      <Route path="my-trips" element={<DriverMyTrips />} />
      <Route path="assigned" element={<DriverAssigned />} />
      <Route path="incidents" element={<DriverIncidents />} />
      <Route path="profile" element={<DriverProfile />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </AppLayout>
);

// Customer routes
const CustomerRoutes = () => (
  <AppLayout>
    <Routes>
      <Route path="dashboard" element={<CustomerDashboard />} />
      <Route path="book" element={<BookTrip />} />
      <Route path="my-trips" element={<CustomerDashboard />} />
      <Route path="history" element={<CustomerDashboard />} />
      <Route path="profile" element={<DriverProfile />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </AppLayout>
);

// Role-based redirect helper
const RoleRedirect = () => {
  const { user } = useAuth();
  const role = user?.role || 'ROLE_CUSTOMER';
  if (role === 'ROLE_DRIVER') return <Navigate to="/driver/dashboard" replace />;
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/routes" element={<Navigate to="/available-trips" replace />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/available-trips" element={<AvailableTrips />} />
      <Route path="/login" element={isAuthenticated ? <RoleRedirect /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <RoleRedirect /> : <Register />} />

      {/* Protected: Admin */}
      <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />

      {/* Protected: Driver */}
      <Route path="/driver/*" element={<ProtectedRoute><DriverRoutes /></ProtectedRoute>} />

      {/* Protected: Customer */}
      <Route path="/customer/*" element={<ProtectedRoute><CustomerRoutes /></ProtectedRoute>} />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={isAuthenticated ? <RoleRedirect /> : <Navigate to="/login" />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
