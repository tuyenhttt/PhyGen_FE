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
    path: '/auth/callback',
    component: lazy(() => import('@/pages/auth/Callback')),
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
    path: '/reset-password',
    component: lazy(() => import('@/pages/auth/UpdatePassword')),
  },
  {
    path: '/matrix',
    component: lazy(() => import('@/pages/matrix/MatrixAndQuestion')),
  },
  {
    path: '/matrix/upload-question',
    component: lazy(() => import('@/pages/matrix/UploadQuestion')),
  },
  {
    path: '/matrix/upload-matrix',
    component: lazy(() => import('@/pages/matrix/UploadMatrix')),
  },
  {
    path: '/exam',
    component: lazy(() => import('@/pages/exams/ExamList')),
  },
  {
    path: '/question',
    component: lazy(() => import('@/pages/questions/QuestionList')),
  },
  {
    path: '/exam-paper/create-exam-paper',
    component: lazy(() => import('@/pages/exams/CreateExamPaper')),
  },
  {
    path: '/about',
    component: lazy(() => import('@/pages/home/AboutUsPage')),
  },
  {
    path: '/admin',
    component: lazy(() => import('@/layouts/AdminLayout')),
    children: [
      {
        index: true,
        component: lazy(() => import('@/pages/admin/dasboard/DashBoard')),
      },
      {
        path: 'users',
        component: lazy(() => import('@/pages/admin/users/ListUser')),
      },
      {
        path: 'books/grade10',
        component: lazy(() => import('@/pages/admin/books/BookGrade10')),
      },
      {
        path: 'books/grade11',
        component: lazy(() => import('@/pages/admin/books/BookGrade11')),
      },
      {
        path: 'books/grade12',
        component: lazy(() => import('@/pages/admin/books/BookGrade12')),
      },
    ],
  },
  {
    path: '/user',
    component: lazy(() => import('@/layouts/UserLayout')),
    children: [
      {
        index: true,
        component: lazy(() => import('@/pages/profile/UserProfile')),
      },
    ],
  },
];
export default publicRoutes;
