import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';
import { toast } from 'react-toastify';
import { confirmlogin, login } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const navigate = useNavigate();

  // Đăng nhập Google với Supabase OAuth
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        console.error('Lỗi đăng nhập Google:', error.message);
        toast.error('Đăng nhập Google thất bại: ' + error.message);
        return;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Đăng nhập với backend API
  // const handleLogin = async e => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const res = await login({ email, password });

  //     const userData = {
  //       email,
  //       fullName: res.data?.name || '',
  //       photoURL: res.data?.avatar || '',
  //     };
  //     localStorage.setItem('custom-user', JSON.stringify(userData));

  //     toast.success('Đăng nhập thành công!');
  //     setLoading(false);
  //     navigate('/');
  //   } catch (error) {
  //     const status = error.response?.data?.statusCode;
  //     const message = error.response?.data?.message;

  //     console.error('Login Error:', error.response?.data);

  //     if (status === 2019 && message === 'Account has not been accepted') {
  //       setPendingUser({ email });
  //       setShowOtpModal(true);
  //       toast.info(
  //         'Tài khoản chưa xác nhận. Vui lòng nhập mã OTP được gửi đến email.'
  //       );
  //     } else {
  //       toast.error(message || 'Đăng nhập thất bại.');
  //     }
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });

      const userData = {
        email,
        fullName: res.data?.name || '',
        photoURL: res.data?.avatar || '',
      };

      // Lưu userData dưới dạng JSON string vào cookie, thiết lập thời gian tồn tại 7 ngày (ví dụ)
      Cookies.set('custom-user', JSON.stringify(userData), {
        expires: 7,
        path: '/',
      });

      toast.success('Đăng nhập thành công!');
      setLoading(false);
      navigate('/');
    } catch (error) {
      const status = error.response?.data?.statusCode;
      const message = error.response?.data?.message;

      console.error('Login Error:', error.response?.data);

      if (status === 2019 && message === 'Account has not been accepted') {
        setPendingUser({ email });
        setShowOtpModal(true);
        toast.info(
          'Tài khoản chưa xác nhận. Vui lòng nhập mã OTP được gửi đến email.'
        );
      } else {
        toast.error(message || 'Đăng nhập thất bại.');
      }
      setLoading(false);
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = async () => {
    try {
      await confirmlogin({
        email: pendingUser?.email,
        otptext: otp,
      });

      toast.success('Xác minh OTP thành công. Vui lòng đăng nhập lại.');
      setShowOtpModal(false);
      setOtp('');
      setPendingUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không chính xác.');
    }
  };

  return (
    <div className='flex min-h-screen flex-col lg:flex-row bg-gray-50'>
      <div className='hidden lg:flex items-center justify-center w-1/2 bg-gradient-to-br from-indigo-100 to-white'>
        <img
          alt='PhyGen'
          src={logo}
          className='rounded-2xl shadow-lg max-h-[350px] w-auto object-cover'
        />
      </div>

      <div className='flex flex-col justify-center w-full lg:w-1/2 px-6 py-10 sm:px-12 bg-white shadow-lg'>
        <div className='mx-auto w-full max-w-md'>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            Đăng nhập
          </h2>

          <form className='mt-8 space-y-6' onSubmit={handleLogin}>
            <TextInput
              id='email'
              label='Email'
              type='email'
              required
              autoComplete='email'
              placeholder='Vui lòng nhập email của bạn'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <TextInput
              id='password'
              label='Mật khẩu'
              type='password'
              required
              autoComplete='current-password'
              placeholder='Vui lòng nhập mật khẩu'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className='flex justify-end text-sm'>
              <Link
                to='/forgot-password'
                className='text-indigo-600 hover:text-indigo-500 font-medium transition'
              >
                Quên mật khẩu?
              </Link>
            </div>

            <PrimaryButton type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </PrimaryButton>
          </form>

          <p className='mt-6 text-center text-sm text-gray-500'>
            Chưa có tài khoản?{' '}
            <Link
              to='/register'
              className='text-indigo-600 hover:text-indigo-500 font-medium transition'
            >
              Đăng ký
            </Link>
          </p>

          <div className='mt-8'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-3 text-gray-500'>
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className='flex justify-center gap-6'>
              <button
                type='button'
                onClick={handleGoogleLogin}
                className='flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 transition'
              >
                <img
                  src='https://www.svgrepo.com/show/475656/google-color.svg'
                  alt='Google'
                  className='h-7 w-10'
                />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        visible={showOtpModal}
        title='Nhập mã OTP để xác nhận đăng nhập'
        onClose={() => setShowOtpModal(false)}
      >
        <TextInput
          id='otp'
          label='OTP'
          type='text'
          required
          placeholder='Nhập mã OTP từ email của bạn'
          value={otp}
          onChange={e => setOtp(e.target.value)}
        />
        <PrimaryButton className='mt-6 w-full' onClick={handleVerifyOtp}>
          Xác minh
        </PrimaryButton>
      </ConfirmModal>
    </div>
  );
};

export default Login;
