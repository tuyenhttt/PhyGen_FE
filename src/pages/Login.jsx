import { Link } from 'react-router-dom';
import { useState } from 'react';
import TextInput from '@components/TextInput';
import PrimaryButton from '@components/Button/PrimaryButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-5 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <img
          alt='Your Company'
          src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
          className='mx-auto h-10 w-auto'
        />
        <h2 className='mt-5 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900'>
          Đăng nhập
        </h2>
      </div>

      <div className='mt-5 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form className='space-y-6'>
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

          <div className='text-sm text-right'>
            <Link
              to='/forgot-password'
              className='font-semibold text-indigo-600 hover:text-indigo-500 display: flex;'
            >
              Quên mật khẩu
            </Link>
          </div>

          <PrimaryButton type='submit'>Đăng nhập</PrimaryButton>
        </form>

        <p className='mt-5 text-center text-sm leading-6 text-gray-500'>
          Chưa có tài khoản?{' '}
          <Link
            to='/register'
            className='font-semibold text-indigo-600 hover:text-indigo-500'
          >
            Đăng ký
          </Link>
        </p>
      </div>
      <div className='mt-6'>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-[400px] mx-auto border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm leading-6'>
            <span className='bg-white px-4 text-gray-500'>
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className='mt-6 flex justify-center gap-10'>
          <button
            type='button'
            className='flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
          >
            <img
              src='https://www.svgrepo.com/show/475656/google-color.svg'
              alt='Google'
              className='h-5 w-5'
            />
            Google
          </button>

          <button
            type='button'
            className='flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
          >
            <img
              src='https://www.svgrepo.com/show/512317/github-142.svg'
              alt='GitHub'
              className='h-5 w-5'
            />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
