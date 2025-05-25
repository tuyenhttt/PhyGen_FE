import { lazy } from 'react';

const privateRoutes = [
  {
    path: '/',
    component: lazy(() => import('@/pages/Users/HomePage')),
  },
  // Thêm các route khác yêu cầu đăng nhập ở đây
];

export default privateRoutes;
