import DetailBook from '@/pages/admin/books/DetailBook';
import DetailUser from '@/pages/admin/users/DetailUser';
import InvoiceDetail from '@/pages/admin/invoice/InvoiceDetail';
import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '@/routes/ProtectedRoute';

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/dasboard/DashBoard'));
const ListUser = lazy(() => import('@/pages/admin/users/ListUser'));
const BookGrade10 = lazy(() => import('@/pages/admin/books/BookGrade10'));
const BookGrade11 = lazy(() => import('@/pages/admin/books/BookGrade11'));
const BookGrade12 = lazy(() => import('@/pages/admin/books/BookGrade12'));
const AdminProfile = lazy(() => import('@/pages/admin/dasboard/AdminProfile'));
const InvoiceList = lazy(() => import('@/pages/admin/invoice/InvoiceList'));
const CurriculumGrade10 = lazy(() =>
  import('@/pages/admin/curriculums/CurriculumGrade10')
);
const CurriculumGrade11 = lazy(() =>
  import('@/pages/admin/curriculums/CurriculumGrade11')
);
const CurriculumGrade12 = lazy(() =>
  import('@/pages/admin/curriculums/CurriculumGrade12')
);
const ExamCategories = lazy(() =>
  import('@/pages/admin/exams/ExamCategories')
);
const Exams = lazy(() =>
  import('@/pages/admin/exams/Exams')
);
const Matrices = lazy(() =>
  import('@/pages/admin/exams/Matrices')
);
const Questions = lazy(() =>
  import('@/pages/admin/exams/Questions')
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
    <Route path='books/grade10' element={<BookGrade10 />} />
    <Route path='books/grade10/:id' element={<DetailBook />} />
    <Route path='books/grade11' element={<BookGrade11 />} />
    <Route path='books/grade12' element={<BookGrade12 />} />
    <Route path='curriculums/grade10' element={<CurriculumGrade10 />} />
    <Route path='curriculums/grade11' element={<CurriculumGrade11 />} />
    <Route path='curriculums/grade12' element={<CurriculumGrade12 />} />
    <Route path='profile' element={<AdminProfile />} />
    <Route path='invoice-list' element={<InvoiceList />} />
    <Route path='invoice-list/:id' element={<InvoiceDetail />} />
    <Route path='exams-categories' element={<ExamCategories />} />
    <Route path='exams-category/exams' element={<Exams />} />
    <Route path='exams-category/matrices' element={<Matrices />} />
    <Route path='exams-category/questions' element={<Questions />} />
  </Route>
);
