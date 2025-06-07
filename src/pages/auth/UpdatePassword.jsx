import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { updatepassword } from '@/services/authService';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import { IoArrowBackOutline } from 'react-icons/io5';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otptext } = location.state || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !otptext) {
      toast.error('Thiếu thông tin xác thực. Vui lòng thử lại từ đầu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await updatepassword({
        email,
        otptext,
        new_password: newPassword,
      });
      toast.success('Cập nhật mật khẩu thành công.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl shadow'>
        <Link to='/login'>
          <IoArrowBackOutline size={24} />
        </Link>

        <h2 className='text-2xl font-bold text-center mb-6'>
          Đặt lại mật khẩu
        </h2>
        <form onSubmit={handleSubmit}>
          <TextInput
            label='Mật khẩu mới'
            type='password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder='Nhập mật khẩu mới'
            showPasswordToggle={true}
          />
          <TextInput
            label='Xác nhận mật khẩu'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            placeholder='Nhập lại mật khẩu'
            showPasswordToggle={true}
          />
          <PrimaryButton
            type='submit'
            className='w-full mt-4'
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
