import React, { useEffect } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { Navigate } from 'react-router';

const ProtectedRoute = ({children, requiredPermission}) => {
  const { isAuthenticated, user,checkAuthStatus } = useAuth();
 
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        if (await checkAuthStatus()) {
          return;
        }
        return <Navigate to={"/login"} replace />;
      }
    };
    verifyAuth();
  }, [isAuthenticated, checkAuthStatus]);

  if (!isAuthenticated) {
    return null;
  }

  if (isAuthenticated && requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to={"/no-permission"} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;