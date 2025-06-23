import { lazy } from 'react';
import { Route } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Callback = lazy(() => import('@/pages/auth/Callback'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/pages/auth/UpdatePassword'));
const AboutUsPage = lazy(() => import('@/pages/home/AboutUsPage'));

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
    <Route path='/about' element={<AboutUsPage />} />
  </>
);
