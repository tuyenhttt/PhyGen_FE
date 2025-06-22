import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '@/components/ui/TextInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';
import { toast } from 'react-toastify';
import { register, confirmlogin } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/supabase/supabaseClient';

const Register = () => {
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const navigate = useNavigate();

  const handleChange = field => e => {
    setForm({ ...form, [field]: e.target.value });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    const allowedEmailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\\.com|[a-zA-Z0-9.-]+\\.edu(\\.vn)?)$/;

    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!allowedEmailRegex.test(form.email)) {
      newErrors.email = 'Email phải là @gmail.com hoặc email (.edu)...';
    }

    if (!form.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!form.firstName.trim()) newErrors.firstName = 'Vui lòng nhập tên';
    if (!form.lastName.trim()) newErrors.lastName = 'Vui lòng nhập họ';
    if (!form.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    )
      newErrors.confirmPassword = 'Mật khẩu không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await register(form);
      setRegisteredEmail(form.email);
      setShowOtpModal(true);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.');
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await confirmlogin({ email: registeredEmail, otptext: otp });
      toast.success('Kích hoạt tài khoản thành công!');
      setShowOtpModal(false);
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Mã OTP không hợp lệ.';
      toast.error(msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
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

          <form className='mt-8 space-y-6' onSubmit={handleRegister}>
            <TextInput
              id='email'
              label='Email'
              placeholder='Vui lòng nhập email'
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
            />

            <TextInput
              id='lastName'
              label='Họ'
              placeholder='Vui lòng nhập họ'
              value={form.lastName}
              onChange={handleChange('lastName')}
              error={errors.lastName}
            />

            <TextInput
              id='firstName'
              label='Tên'
              placeholder='Vui lòng nhập tên'
              value={form.firstName}
              onChange={handleChange('firstName')}
              error={errors.firstName}
            />

            <div className='space-y-1'>
              <label
                htmlFor='gender'
                className='block text-sm font-medium text-gray-700'
              >
                Giới tính
              </label>
              <select
                id='gender'
                value={form.gender}
                onChange={handleChange('gender')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>-- Chọn giới tính --</option>
                <option value='Nam'>Nam</option>
                <option value='Nữ'>Nữ</option>
                <option value='Khác'>Khác</option>
              </select>
              {errors.gender && (
                <p className='text-sm text-red-600'>{errors.gender}</p>
              )}
            </div>

            <TextInput
              id='password'
              label='Mật khẩu'
              type='password'
              placeholder='Vui lòng nhập mật khẩu'
              value={form.password}
              onChange={handleChange('password')}
              showPasswordToggle={true}
              error={errors.password}
            />

            <TextInput
              id='confirmPassword'
              label='Xác nhận lại mật khẩu'
              type='password'
              placeholder='Vui lòng xác nhận lại mật khẩu'
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              showPasswordToggle={true}
              error={errors.confirmPassword}
            />

            <PrimaryButton type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
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

            <div className='flex justify-center gap-6 mb-10'>
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
        title='Nhập mã OTP để kích hoạt tài khoản'
        onClose={() => setShowOtpModal(false)}
      >
        <TextInput
          id='otp'
          label='OTP'
          type='text'
          placeholder='Nhập mã OTP từ email'
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

export default Register;
