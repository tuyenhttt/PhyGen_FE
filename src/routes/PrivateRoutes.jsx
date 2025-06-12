import { useAuth } from '@/contexts/AuthContext';
import { lazy } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';

const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-lg font-medium text-gray-800 animate-pulse'>
          Đang tải nội dung...
        </p>
      </div>
    );

  if (!user) {
    // Nếu chưa login thì redirect về login
    return <Navigate to='/login' replace />;
  }

  // Nếu đã login, render các route con (Outlet)
  return <Outlet />;
}

export const PrivateRoutes = () => (
  <Route element={<PrivateRoute />}>
    <Route path='/user' element={<MainLayout />}>
      <Route index element={<UserProfile />} />
    </Route>
  </Route>
);
