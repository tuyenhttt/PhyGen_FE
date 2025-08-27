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
        // 1) Lấy session từ Supabase sau khi redirect
        const { data, error: sessionError } = await supabase.auth.getSession();
        const session = data?.session;

        if (sessionError || !session) {
          toast.error('Không lấy được phiên đăng nhập từ Supabase.');
          navigate('/login');
          return;
        }

        const { user, access_token: accessToken } = session;

        // 2) Gọi backend để xác thực bằng OAuth token (và email từ Supabase)
        const baseURL = import.meta.env.VITE_BASE_URL + '/api/auths/login';
        const response = await fetch(baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: user.email }),
        });

        let resData = {};
        try {
          resData = await response.json();
        } catch (_) {
          resData = {};
        }

        const statusCode = resData?.statusCode ?? response.status;

        if (!response.ok) {
          if (statusCode === 2267) {
            toast.error(resData?.message || 'Tài khoản đã bị khóa.');
          } else if (statusCode === 2265) {
            toast.error(resData?.message || 'Tài khoản chưa xác nhận.');
          } else {
            toast.error(resData?.message || 'Đăng nhập Google thất bại.');
          }

          try {
            await supabase.auth.signOut();
          } catch (_) {}
          Cookies.remove('custom-user', { path: '/' });
          Cookies.remove('token', { path: '/' });
          navigate('/login');
          return;
        }

        // Trường hợp backend trả 200 nhưng vẫn có statusCode lỗi (phòng hờ)
        if (resData?.statusCode === 2267) {
          toast.error(resData?.message || 'Tài khoản đã bị khóa.');
          try {
            await supabase.auth.signOut();
          } catch (_) {}
          Cookies.remove('custom-user', { path: '/' });
          Cookies.remove('token', { path: '/' });
          navigate('/login');
          return;
        }

        // 5) Thành công: decode token & lưu thông tin
        const decoded = jwtDecode(resData.token);
        const userId = decoded && decoded.sub;
        const loginMethod = user?.app_metadata?.provider;

        const userData = {
          id: userId,
          email: user.email,
          fullName: user?.user_metadata?.full_name || '',
          photoURL: user?.user_metadata?.avatar_url || '',
          role: resData?.role || 'User',
          loginMethod,
          token: resData?.token,
        };

        // 6) Lưu cookie & context
        Cookies.set('custom-user', JSON.stringify(userData), {
          expires: 0.5,
          path: '/',
        });
        Cookies.set('token', resData.token, { expires: 0.5, path: '/' });

        authLogin(userData);
        toast.success('Đăng nhập thành công!');

        // 7) Điều hướng 1 lần
        navigate(userData.role === 'Admin' ? '/admin' : '/');
      } catch (err) {
        console.error('Lỗi trong Auth Callback:', err);
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        Cookies.remove('custom-user', { path: '/' });
        Cookies.remove('token', { path: '/' });
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
