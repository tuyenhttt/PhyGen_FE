import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoutes, PublicRoutes } from './PublicRoutes';
import { AdminRoutes } from './AdminRoutes';
import MainLayout from '@/layouts/MainLayout';
import { UserRoutes } from '@/routes/UserRoutes';
import { PublicRoute } from '@/routes/ProtectedRoute';
import NotFound from '@/layouts/NotFound';

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center h-screen'>
          <p className='text-lg font-medium text-gray-800 animate-pulse'>
            Đang tải nội dung...
          </p>
        </div>
      }
    >
      <Routes>
        {/* Route công khai: login, register, ... */}
        {AuthRoutes()}

        {/* Chặn admin vào public pages */}
        <Route element={<PublicRoute />}>
          <Route element={<MainLayout />}>{PublicRoutes()}</Route>
        </Route>

        {/* Route dành riêng cho user */}
        {UserRoutes()}

        {/* Route dành riêng cho admin */}
        {AdminRoutes()}

        {/* Redirect fallback */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
