
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Role } from '../../types';

interface Props {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Redirect to their own dashboard if unauthorized
  }

  return <Outlet />;
};
