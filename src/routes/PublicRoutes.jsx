import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Callback = lazy(() => import('@/pages/auth/Callback'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/pages/auth/UpdatePassword'));
const MatrixAndQuestion = lazy(() =>
  import('@/pages/matrix/MatrixAndQuestion')
);
const UploadQuestion = lazy(() => import('@/pages/matrix/UploadQuestion'));
const UploadMatrix = lazy(() => import('@/pages/matrix/UploadMatrix'));
const ExamList = lazy(() => import('@/pages/exams/ExamList'));
const QuestionList = lazy(() => import('@/pages/questions/QuestionList'));
const CreateExamPaper = lazy(() => import('@/pages/exams/CreateExamPaper'));
const AboutUsPage = lazy(() => import('@/pages/home/AboutUsPage'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));

export const AuthRoutes = () => (
  <>
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/forgot-password' element={<ForgotPassword />} />
    <Route path='/reset-password' element={<UpdatePassword />} />
    <Route path='/auth/callback' element={<Callback />} />
  </>
);

export const PublicRoutes = () => (
  <>
    <Route path='/' element={<HomePage />} />
    <Route path='/matrix' element={<MatrixAndQuestion />} />
    <Route path='/matrix/upload-question' element={<UploadQuestion />} />
    <Route path='/matrix/upload-matrix' element={<UploadMatrix />} />
    <Route path='/exam' element={<ExamList />} />
    <Route path='/question' element={<QuestionList />} />
    <Route path='/exam-paper/create-exam-paper' element={<CreateExamPaper />} />
    <Route path='/about' element={<AboutUsPage />} />
    <Route path='/user' element={<UserProfile />} />
  </>
);
