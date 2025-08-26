import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';
import { toast } from 'react-toastify';
import { confirmlogin, login } from '@/services/authService';
import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const isOtpRequired = error => {
  const data = error?.response?.data || {};
  const httpStatus = error?.response?.status;

  const statusCode = data.statusCode ?? httpStatus;
  const code = data.code;
  const msg = (data.message || '').toString().toLowerCase();

  const messageHints = ['chưa được xác nhận', 'unconfirmed', 'otp'];
  const messageMatched = messageHints.some(k => msg.includes(k));

  return (
    code === 'ACCOUNT_UNCONFIRMED' ||
    code === 'OTP_REQUIRED' ||
    statusCode === 2258 ||
    statusCode === 2161 ||
    messageMatched
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      });
      if (error) {
        console.error('Lỗi đăng nhập Google:', error.message);
        toast.error('Đăng nhập Google thất bại: ' + error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Đăng nhập với backend API
  const handleLogin = async e => {
    e.preventDefault();

    let valid = true;
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    } else setEmailError('');
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else setPasswordError('');
    if (!valid) return;

    setLoading(true);

    try {
      const res = await login({ email, password });

      const decoded = jwtDecode(res.data.token);
      const userId = decoded?.sub;

      const userData = {
        id: userId,
        email,
        fullName:
          res.data.lastName + ' ' + res.data.firstName || res.data?.name || '',
        photoURL: res.data?.photoURL || '',
        role: res.data?.role || 'User',
      };

      const COOKIE_OPTIONS = { path: '/', expires: 1 };
      Cookies.set('custom-user', JSON.stringify(userData), COOKIE_OPTIONS);
      Cookies.set('token', res.data.token, COOKIE_OPTIONS);

      authLogin(userData);
      toast.success('Đăng nhập thành công!');
      setLoading(false);

      if (userData.role === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      const message = error?.response?.data?.message ?? '';
      const status =
        error?.response?.data?.statusCode ?? error?.response?.status;

      console.log('[LOGIN_ERROR]', {
        status,
        code: error?.response?.data?.code,
        message,
      });

      if (isOtpRequired(error)) {
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
      await confirmlogin({ email: pendingUser?.email, otptext: otp });
      toast.success('Xác minh OTP thành công. Vui lòng đăng nhập lại.');
      setShowOtpModal(false);
      setOtp('');
      setPendingUser(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Mã OTP không chính xác.');
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
              autoComplete='email'
              placeholder='Vui lòng nhập email của bạn'
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={emailError}
            />

            <TextInput
              id='password'
              label='Mật khẩu'
              type='password'
              autoComplete='current-password'
              placeholder='Vui lòng nhập mật khẩu'
              value={password}
              showPasswordToggle={true}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              error={passwordError}
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

      {showOtpModal && (
        <div
          role='dialog'
          aria-modal='true'
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              borderRadius: 12,
              background: '#fff',
              padding: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <button
              type='button'
              onClick={() => setShowOtpModal(false)}
              aria-label='Close'
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Nhập mã OTP để xác nhận đăng nhập
            </h3>

            <TextInput
              id='otp'
              label='OTP'
              type='text'
              required
              placeholder='Nhập mã OTP từ email của bạn'
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            <PrimaryButton
              type='button'
              className='mt-6 w-full'
              onClick={handleVerifyOtp}
              style={{ marginTop: 16, width: '100%' }}
            >
              Xác minh
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
