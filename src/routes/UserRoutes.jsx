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
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));

export const UserRoutes = () => (
  <Route element={<UserRoute />}>
    <Route element={<MainLayout />}>
      <Route path='/user' element={<UserProfile />} />
      <Route path='/matrix' element={<Matrix />} />
      <Route path='/matrix/upload-matrix' element={<UploadMatrix />} />
      <Route path='/question' element={<QuestionList />} />
      <Route path='/question/upload-question' element={<UploadQuestion />} />
      <Route path='/exam' element={<ExamList />} />
      <Route
        path='/exam-paper/create-exam-paper'
        element={<CreateExamPaper />}
      />
    </Route>
  </Route>
);
