import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Home from './pages/public/Home';
import ExploreDonations from './pages/public/ExploreDonations';
import DonationDetail from './pages/public/DonationDetail';
import HowItWorks from './pages/public/HowItWorks';
import SafetyGuidelines from './pages/public/SafetyGuidelines';

// Role Dashboards & Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateDonation from './pages/donor/CreateDonation';
import IncomingRequests from './pages/donor/IncomingRequests';

import NgoDashboard from './pages/ngo/NgoDashboard';
import NgoRequests from './pages/ngo/NgoRequests';

import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AvailableTasks from './pages/volunteer/AvailableTasks';
import MyVolunteerTasks from './pages/volunteer/MyVolunteerTasks';

import AdminDashboard from './pages/admin/AdminDashboard';

// Entry router component for '/'
function InitialEntry() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Loading FoodBridge...</p>
      </div>
    );
  }

  // If already authenticated, route straight to role dashboard
  if (user) {
    if (user.role === 'DONOR') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'NGO') return <Navigate to="/ngo/dashboard" replace />;
    if (user.role === 'VOLUNTEER') return <Navigate to="/volunteer/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  // First-time or unauthenticated entry -> Login page
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Initial Website Entry: Login page for unauthenticated users, Role Dashboard for authenticated */}
              <Route path="/" element={<InitialEntry />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public Platform Exploration */}
              <Route path="/home" element={<Home />} />
              <Route path="/donations" element={<ExploreDonations />} />
              <Route path="/donations/:id" element={<DonationDetail />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/safety" element={<SafetyGuidelines />} />

              {/* Protected Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/create"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <CreateDonation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/requests"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <IncomingRequests />
                  </ProtectedRoute>
                }
              />

              {/* Protected NGO Routes */}
              <Route
                path="/ngo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NgoDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/requests"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NgoRequests />
                  </ProtectedRoute>
                }
              />

              {/* Protected Volunteer Routes */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/tasks"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <AvailableTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/my-tasks"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <MyVolunteerTasks />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
