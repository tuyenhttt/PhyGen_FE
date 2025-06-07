import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthRoutes, PublicRoutes } from './PublicRoutes';
import { AdminRoutes } from './AdminRoutes';
import MainLayout from '@/layouts/MainLayout';

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {AuthRoutes()}

        <Route element={<MainLayout />}>{PublicRoutes()}</Route>

        {AdminRoutes()}

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Suspense>
  );
}
