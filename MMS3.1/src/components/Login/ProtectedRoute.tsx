// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'src/context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, verifyToken } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      if (isAuthenticated) {
        await verifyToken();
      }
    };
    checkToken();
  }, [isAuthenticated, verifyToken]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;