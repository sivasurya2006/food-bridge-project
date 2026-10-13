import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">Verifying authorization...</p>
      </div>
    );
  }

  // Not logged in -> redirect to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: User is logged in but doesn't have the permitted role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine user's rightful dashboard
    let targetPath = '/login';
    if (user.role === 'DONOR') targetPath = '/donor/dashboard';
    else if (user.role === 'NGO') targetPath = '/ngo/dashboard';
    else if (user.role === 'VOLUNTEER') targetPath = '/volunteer/dashboard';
    else if (user.role === 'ADMIN') targetPath = '/admin/dashboard';

    return <Navigate to={targetPath} replace />;
  }

  return children;
}
