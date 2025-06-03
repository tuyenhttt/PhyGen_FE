import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { forgetpassword } from '@/services/authService';
import { IoArrowBackOutline } from 'react-icons/io5';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await forgetpassword({ email });
      toast.success('OTP đã được gửi đến email của bạn.');
      setShowOtpModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Không thể gửi email khôi phục mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpConfirm = () => {
    if (!otp.trim()) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }
    navigate('/reset-password', {
      state: {
        email,
        otptext: otp,
      },
    });
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

        <form onSubmit={handleSendEmail}>
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
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </PrimaryButton>
          </div>
        </form>

        <p className='mt-6 text-sm text-gray-600 text-center'>
          Mã OTP sẽ được gửi đến email của bạn
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

      {/* Modal nhập OTP */}
      <ConfirmModal
        visible={showOtpModal}
        title='Nhập mã OTP'
        onClose={() => setShowOtpModal(false)}
      >
        <div className='space-y-4'>
          <TextInput
            label='Mã OTP'
            placeholder='Nhập mã OTP từ email'
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <div className='flex justify-end gap-2 pt-2'>
            <button
              onClick={() => setShowOtpModal(false)}
              className='px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300'
            >
              Huỷ
            </button>
            <button
              onClick={handleOtpConfirm}
              className='px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700'
            >
              Xác nhận
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ForgotPassword;
