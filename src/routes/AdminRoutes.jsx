import DetailBook from '@/pages/admin/books/DetailBook';
import DetailUser from '@/pages/admin/users/DetailUser';
import InvoiceDetail from '@/pages/admin/invoice/InvoiceDetail';
import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '@/routes/ProtectedRoute';

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/dasboard/DashBoard'));
const ListUser = lazy(() => import('@/pages/admin/users/ListUser'));
const SubjectBook = lazy(() => import('@/pages/admin/books/SubjectBook'));
const AdminProfile = lazy(() => import('@/pages/admin/dasboard/AdminProfile'));
const InvoiceList = lazy(() => import('@/pages/admin/invoice/InvoiceList'));
const Curriculum = lazy(() =>import('@/pages/admin/curriculums/Curriculum'));
const ExamCategories = lazy(() => import('@/pages/admin/exams/ExamCategories'));
const Exams = lazy(() => import('@/pages/admin/exams/Exams'));
const Matrices = lazy(() => import('@/pages/admin/exams/Matrices'));
const Questions = lazy(() => import('@/pages/admin/exams/Questions'));
const QuestionList = lazy(() => import('@/pages/admin/books/QuestionList'));
const SendNotification = lazy(() =>
  import('@/pages/admin/dasboard/SendNotification')
);

export const AdminRoutes = () => (
  <Route
    path='/admin'
    element={
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    }
  >
    <Route index element={<Dashboard />} />
    <Route path='users' element={<ListUser />} />
    <Route path='users/:id' element={<DetailUser />} />
    <Route path='subject-book' element={<SubjectBook />} />
    <Route path='subject-book/:id' element={<DetailBook />} />
    <Route path='topics/:id/questions' element={<QuestionList />} />
    <Route path='curriculums/:year/:curriculumId' element={<Curriculum />} />
    <Route path='profile' element={<AdminProfile />} />
    <Route path='invoice-list' element={<InvoiceList />} />
    <Route path='invoice-list/:id' element={<InvoiceDetail />} />
    <Route path='exams-categories' element={<ExamCategories />} />
    <Route path='exams-category/exams' element={<Exams />} />
    <Route path='exams-category/matrices' element={<Matrices />} />
    <Route path='exams-category/questions' element={<Questions />} />
    <Route path='notifications/send' element={<SendNotification />} />
  </Route>
);
