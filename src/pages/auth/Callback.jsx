import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const Callback = () => {
  const navigate = useNavigate();
  const didRun = useRef();

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const handleOAuthCallback = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast.error('Không lấy được session từ Supabase');
          return;
        }

        const user = session.user;
        const accessToken = session.access_token;

        const userData = {
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          photoURL: user.user_metadata?.avatar_url || '',
        };

        // Lưu userData vào cookie (1 ngày)
        Cookies.set('custom-user', JSON.stringify(userData), {
          expires: 1,
          path: '/',
        });

        // Gửi token về backend
        await fetch('https://localhost:7172/api/Auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: user.email,
          }),
        });

        toast.success('Đăng nhập thành công');
        navigate('/');
      } catch (error) {
        console.error('Lỗi trong Auth Callback:', error);
        toast.error('Đăng nhập thất bại sau khi xác thực Google.');
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
