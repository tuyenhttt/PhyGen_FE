import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
  if (user.role !== 'admin') {
    return <Navigate to='/' replace />;
  }
  return children ? children : <Outlet />;
}
