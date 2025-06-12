import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// PrivateRoute cho user đã đăng nhập
export function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return children ? children : <Outlet />;
}

// AdminRoute kiểm tra thêm role admin
export function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  if (user.role !== 'Admin') {
    return <Navigate to='/' replace />;
  }
  return children ? children : <Outlet />;
}
