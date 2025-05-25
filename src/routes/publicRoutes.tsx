import { lazy } from 'react';

const publicRoutes = [
  {
    path: '/login',
    component: lazy(() => import('@/pages/Login')),
  },
  {
    path: '/register',
    component: lazy(() => import('@/pages/Users/Register')),
  },
  {
    path: '/forgot-password',
    component: lazy(() => import('@/pages/ForgotPassword')),
  },
];

export default publicRoutes;
