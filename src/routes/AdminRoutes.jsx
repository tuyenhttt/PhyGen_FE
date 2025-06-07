import { lazy } from 'react';
import { Route } from 'react-router-dom';

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/dasboard/DashBoard'));
const ListUser = lazy(() => import('@/pages/admin/users/ListUser'));
const BookGrade10 = lazy(() => import('@/pages/admin/books/BookGrade10'));
const BookGrade11 = lazy(() => import('@/pages/admin/books/BookGrade11'));
const BookGrade12 = lazy(() => import('@/pages/admin/books/BookGrade12'));

export const AdminRoutes = () => (
  <Route path='/admin' element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path='users' element={<ListUser />} />
    <Route path='books/grade10' element={<BookGrade10 />} />
    <Route path='books/grade11' element={<BookGrade11 />} />
    <Route path='books/grade12' element={<BookGrade12 />} />
  </Route>
);
