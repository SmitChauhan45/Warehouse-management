import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff';
}

const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location }} 
      />
    );
  }

  // Role-based access
  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin' && user?.role === 'staff') {
      // Staff trying to access admin-only page
      return (
        <Navigate 
          to="/dashboard" 
          replace 
          state={{ 
            message: "You don't have permission to access that page." 
          }} 
        />
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;