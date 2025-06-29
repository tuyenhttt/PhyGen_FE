import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const Callback = () => {
  const navigate = useNavigate();
  const didRun = useRef(false);
  const { login: authLogin } = useAuth();

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

        const baseURL = import.meta.env.VITE_BASE_URL + '/api/auths/login';

        // Gửi access token + email về backend để xác thực
        const response = await fetch(baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: user.email }),
        });

        const resData = await response.json();
        const decoded = jwtDecode(resData.token);
        const userId = decoded?.sub;

        if (!response.ok) {
          toast.error(resData.message || 'Đăng nhập thất bại.');
          await supabase.auth.signOut();
          Cookies.remove('custom-user');
          navigate('/login');
          return;
        }

        const loginMethod = user.app_metadata?.provider;

        // Lưu thông tin user
        const userData = {
          id: userId,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          photoURL: user.user_metadata?.avatar_url || '',
          role: resData.role || 'User',
          loginMethod,
        };

        // Set cookie
        Cookies.set('custom-user', JSON.stringify(userData), {
          expires: 1,
          path: '/',
        });

        Cookies.set('token', resData.token, {
          expires: 1,
          path: '/',
        });
        authLogin(userData);
        await new Promise(resolve => setTimeout(resolve, 100));

        toast.success('Đăng nhập thành công!');

        if (userData.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Lỗi trong Auth Callback:', error);
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [navigate, authLogin]);

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <p className='text-gray-700 text-lg'>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default Callback;
