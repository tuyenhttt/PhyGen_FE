import { lazy } from 'react';

const publicRoutes = [
  {
    path: '/',
    component: lazy(() => import('@/pages/home/HomePage')),
  },
  {
    path: '/login',
    component: lazy(() => import('@/pages/auth/Login')),
  },
  {
    path: '/register',
    component: lazy(() => import('@/pages/auth/Register')),
  },
  {
    path: '/forgot-password',
    component: lazy(() => import('@/pages/auth/ForgotPassword')),
  },
  {
    path: '/matrix',
    component: lazy(() => import('@/pages/matrix/MatrixAndQuestion')),
  },
];

export default publicRoutes;
