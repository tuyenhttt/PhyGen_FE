import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { UserRoute } from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';

const Matrix = lazy(() => import('@/pages/matrix/Matrix'));
const UploadMatrix = lazy(() => import('@/pages/matrix/UploadMatrix'));
const UploadQuestion = lazy(() => import('@/pages/questions/UploadQuestion'));
const QuestionList = lazy(() => import('@/pages/questions/QuestionList'));
const CreateExamPaper = lazy(() => import('@/pages/exams/CreateExamPaper'));
const ExamList = lazy(() => import('@/pages/exams/ExamList'));
const ExamDetail = lazy(() => import('@/pages/exams/ExamDetail'));
const MatrixDetail = lazy(() => import('@/pages/matrix/MatrixDetail'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));
const CheckoutPage = lazy(() => import('@/pages/payment/CheckoutPage'));
const PaymentSucess = lazy(() => import('@/pages/payment/PaymentSuccessPage'));
const PaymentFailed = lazy(() => import('@/pages/payment/PaymentFailedPage'));
const PaymentHistory = lazy(() => import('@/pages/payment/PaymentHistory'));

export const UserRoutes = () => (
  <Route element={<UserRoute />}>
    <Route element={<MainLayout />}>
      <Route path='/user' element={<UserProfile />} />
      <Route path='/matrix' element={<Matrix />} />
      <Route path='/matrix/matrix-detail/:id' element={<MatrixDetail />} />
      <Route path='/matrix/upload-matrix' element={<UploadMatrix />} />
      <Route path='/question' element={<QuestionList />} />
      <Route path='/question/upload-question' element={<UploadQuestion />} />
      <Route path='/exam' element={<ExamList />} />
      <Route path='/exam/:examId/exam-detail' element={<ExamDetail />} />
      <Route
        path='/exam-paper/create-exam-paper'
        element={<CreateExamPaper />}
      />
      <Route path='/payment' element={<CheckoutPage />} />
      <Route path='/payment/success' element={<PaymentSucess />} />
      <Route path='/payment/failed' element={<PaymentFailed />} />
      <Route path='/payment/history' element={<PaymentHistory />} />
    </Route>
  </Route>
);
