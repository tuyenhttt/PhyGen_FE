import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import { updatepassword } from '@/services/authService';
import { toast } from 'react-toastify';
import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await updatepassword({ email });
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu.');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Không thể gửi email khôi phục mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50'>
      <div className='mx-auto w-full max-w-md bg-white p-8 rounded-lg shadow-md'>
        <Link to='/login'>
          <IoArrowBackOutline size={24} />
        </Link>

        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Khôi phục mật khẩu
        </h2>

        <form onSubmit={handleSubmit}>
          <div className='mt-8'>
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
          </div>

          <div className='mt-6'>
            <PrimaryButton type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi'}
            </PrimaryButton>
          </div>
        </form>

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
