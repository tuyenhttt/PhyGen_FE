import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase';
import { toast } from 'react-toastify';
import { login } from '@/services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google login success:', user);
      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Đăng nhập Google thất bại.');
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await login({ email, password });

      const fakeUser = {
        uid: 'backend-' + Date.now(),
        email,
        displayName: res.data?.name || '',
        photoURL: res.data?.photoURL || '',
      };

      auth.currentUser = fakeUser;

      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
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
              autoComplete='password'
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

            <PrimaryButton type='submit' className='w-full'>
              Đăng nhập
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
                style={{ cursor: 'pointer' }}
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
    </div>
  );
};

export default Login;
