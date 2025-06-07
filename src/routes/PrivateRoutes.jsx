import React, { lazy } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';

// Giả sử bạn có cách kiểm tra auth user
import { useAuth } from '@/hooks/useAuth';

const UserLayout = lazy(() => import('@/layouts/UserLayout'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Nếu chưa login thì redirect về login
    return <Navigate to='/login' replace />;
  }

  // Nếu đã login, render các route con (Outlet)
  return <Outlet />;
}

export const PrivateRoutes = () => (
  <Route element={<PrivateRoute />}>
    <Route path='/user' element={<UserLayout />}>
      <Route index element={<UserProfile />} />
    </Route>
  </Route>
);
