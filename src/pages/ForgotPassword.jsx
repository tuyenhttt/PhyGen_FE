import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';

const ForgotPassword = () => {
  return (
    <div className='flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50'>
      <div className='mx-auto w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <Link to='/login'>
          <IoArrowBackOutline size={24} />
        </Link>

        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Khôi phục mật khẩu
        </h2>

        <div className='mt-8'>
          <TextInput
            id='email'
            label='Email'
            type='email'
            required
            autoComplete='email'
            placeholder='Vui lòng nhập email của bạn'
          />
        </div>

        <div className='mt-6'>
          <PrimaryButton className='w-full'>Gửi</PrimaryButton>
        </div>

        <p className='mt-6 text-sm text-gray-600 text-center'>
          Hướng dẫn cài đặt lại mật khẩu sẽ được gửi đến địa chỉ email bạn đã sử
          dụng để đăng ký tài khoản
        </p>

        <div className='mt-6 flex justify-center'>
          <Link
            to='/login'
            className='text-indigo-600 hover:text-indigo-500 font-medium'
          >
            Đăng nhập với tài khoản của bạn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
