import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className='flex min-h-screen flex-col lg:flex-row bg-gray-50'>
      <div className='hidden lg:flex items-center justify-center w-1/2 bg-gradient-to-br from-indigo-100 to-white'>
        <img
          alt='PhyGen'
          src={logo}
          className='rounded-2xl shadow-lg max-h-[350px] w-auto object-cover'
        />
      </div>

      <div className='flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 bg-white shadow-lg'>
        <div className='mx-auto w-full max-w-md'>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            Đăng ký
          </h2>

          <form className='mt-8 space-y-6'>
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
              autoComplete='new-password'
              placeholder='Vui lòng nhập mật khẩu'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <TextInput
              id='confirm-password'
              label='Xác nhận lại mật khẩu'
              type='password'
              required
              autoComplete='new-password'
              placeholder='Vui lòng nhập lại mật khẩu'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            <PrimaryButton type='submit' className='w-full'>
              Đăng ký
            </PrimaryButton>
          </form>

          <p className='mt-6 text-center text-sm text-gray-500'>
            Nếu bạn đã có tài khoản{' '}
            <Link
              to='/login'
              className='text-indigo-600 hover:text-indigo-500 font-medium transition'
            >
              vui lòng đăng nhập tại đây
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

export default Register;
