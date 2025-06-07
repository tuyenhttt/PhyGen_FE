import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthRoutes, PublicRoutes } from './PublicRoutes';
import { AdminRoutes } from './AdminRoutes';
import MainLayout from '@/layouts/MainLayout';

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
        {AuthRoutes()}

        <Route element={<MainLayout />}>{PublicRoutes()}</Route>

        {AdminRoutes()}

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Suspense>
  );
}
