import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Route dành cho user
export function UserRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );

  if (!user) return <Navigate to='/login' replace />;

  return <Outlet />;
}

export function PublicRoute() {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <Navigate to='/admin' replace />;
  }

  return <Outlet />;
}

// Route dành cho admin
export function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );

  if (!user) return <Navigate to='/login' replace />;

  if (user.role !== 'Admin') return <Navigate to='/' replace />;

  return children || <Outlet />;
}
