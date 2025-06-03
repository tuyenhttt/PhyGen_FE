// import { lazy } from 'react';

// const publicRoutes = [
//   {
//     path: '/',
//     component: lazy(() => import('@/pages/home/HomePage')),
//   },
//   {
//     path: '/login',
//     component: lazy(() => import('@/pages/auth/Login')),
//   },
//   {
//     path: '/register',
//     component: lazy(() => import('@/pages/auth/Register')),
//   },
//   {
//     path: '/forgot-password',
//     component: lazy(() => import('@/pages/auth/ForgotPassword')),
//   },
//   {
//     path: '/matrix',
//     component: lazy(() => import('@/pages/matrix/MatrixAndQuestion')),
//   },
//   {
//     path: '/matrix/upload-question',
//     component: lazy(() => import('@/pages/matrix/UploadQuestion')),
//   },
//   {
//     path: '/matrix/upload-matrix',
//     component: lazy(() => import('@/pages/matrix/UploadMatrix')),
//   },
//   {
//     path: '/exam-paper',
//     component: lazy(() => import('@/pages/exams/ExamPaperList')),
//   },
//   {
//     path: '/exam-paper/create-exam-paper',
//     component: lazy(() => import('@/pages/exams/CreateExamPaper')),
//   },
//   {
//     path: '/admin',
//     component: lazy(() => import('@/layouts/AdminLayout')),
//     children: [
//       {
//         path: '',
//         component: lazy(() => import('@/pages/admin/dasboard/DashBoard')),
//       },
//       {
//         path: 'users',
//         component: lazy(() => import('@/pages/admin/users/ListUser')),
//       },
//     ],
//   },
// ];

// export default publicRoutes;

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
    ],
  },
];
export default publicRoutes;
