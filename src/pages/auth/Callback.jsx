import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const Callback = () => {
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const handleOAuthCallback = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Không lấy được phiên đăng nhập từ Supabase.');
          navigate('/login');
          return;
        }

        const { user, access_token: accessToken } = session;

        // Gửi access token + email về backend để xác thực
        const response = await fetch('https://localhost:7172/api/Auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: user.email }),
        });

        const resData = await response.json();

        if (!response.ok) {
          toast.error(resData.message || 'Đăng nhập thất bại.');
          await supabase.auth.signOut();
          Cookies.remove('custom-user');
          navigate('/login');
          return;
        }

        // Lưu thông tin vào cookie
        const userData = {
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          photoURL: user.user_metadata?.avatar_url || '',
        };

        Cookies.set('custom-user', JSON.stringify(userData), {
          expires: 1, // 1 ngày
          path: '/',
        });

        toast.success('Đăng nhập thành công!');
        navigate('/');
      } catch (error) {
        console.error('Lỗi trong Auth Callback:', error);
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <p className='text-gray-700 text-lg'>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default Callback;
