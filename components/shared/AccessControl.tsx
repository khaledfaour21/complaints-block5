import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Role } from '../../types';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  allowedRoles,
  redirectTo
}) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has permission
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    // Determine redirect path based on user role
    const getDefaultRedirect = (userRole: Role): string => {
      switch (userRole) {
        case Role.MANAGER:
          return '/dashboard/manager';
        case Role.ADMIN:
          return '/dashboard/admin';
        case Role.MUKTAR:
          return '/dashboard/muktar';
        case Role.CITIZEN:
        default:
          return '/submit';
      }
    };

    const redirectPath = redirectTo || getDefaultRedirect(user.role);
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAccessControl = (
  Component: React.ComponentType<any>,
  allowedRoles: Role[],
  redirectTo?: string
) => {
  return (props: any) => (
    <AccessControl allowedRoles={allowedRoles} redirectTo={redirectTo}>
      <Component {...props} />
    </AccessControl>
  );
};

// Role-based dashboard access control
export const DashboardAccessControl: React.FC<{
  children: React.ReactNode;
  dashboardType: 'manager' | 'admin' | 'muktar';
}> = ({ children, dashboardType }) => {
  const { user } = useAuthStore();

  const getAllowedRoles = (type: string): Role[] => {
    switch (type) {
      case 'manager':
        return [Role.MANAGER, Role.ADMIN];
      case 'admin':
        return [Role.MANAGER, Role.ADMIN];
      case 'muktar':
        return [Role.MANAGER, Role.ADMIN, Role.MUKTAR];
      default:
        return [];
    }
  };

  const getRedirectPath = (userRole: Role): string => {
    switch (userRole) {
      case Role.MANAGER:
        return '/dashboard/manager';
      case Role.ADMIN:
        return '/dashboard/admin';
      case Role.MUKTAR:
        return '/dashboard/muktar';
      default:
        return '/submit';
    }
  };

  return (
    <AccessControl 
      allowedRoles={getAllowedRoles(dashboardType)}
      redirectTo={user ? getRedirectPath(user.role) : '/login'}
    >
      {children}
    </AccessControl>
  );
};