import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  const path = location.pathname;
  if (path.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.startsWith('/doctor') && user.role !== 'doctor') {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.startsWith('/nurse') && user.role !== 'nurse') {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.startsWith('/pharmacist') && user.role !== 'pharmacist') {
    return <Navigate to="/dashboard" replace />;
  }
  if (path.startsWith('/appointments') && user.role !== 'receptionist') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute;