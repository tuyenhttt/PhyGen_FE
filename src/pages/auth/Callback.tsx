// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/supabase/supabaseClient';
// import axios from 'axios';

// export default function Callback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleOAuthCallback = async () => {
//       try {
//         // Lấy dữ liệu phiên sau khi người dùng đăng nhập
//         const { data, error } = await supabase.auth.getSession();

//         if (error) {
//           console.error('Lỗi khi lấy session:', error.message);
//           return;
//         }

//         const accessToken = data?.session?.access_token;

//         if (!accessToken) {
//           console.error('Không tìm thấy access token từ Supabase');
//           return;
//         }

//         // Gửi access token lên server để kiểm tra hoặc tạo user
//         const response = await axios.post(
//           'https://localhost:7172/api/Auth/confirmlogin',
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );
//         console.log('Đăng nhập thành công:', response.data);
//         console.log(accessToken);

//         // Chuyển hướng người dùng sau khi login
//         navigate('/');
//       } catch (err: any) {
//         console.error('Lỗi trong Auth Callback:', err);
//       }
//     };

//     handleOAuthCallback();
//   }, [navigate]);

//   return (
//     <div className='flex items-center justify-center h-screen'>
//       <p className='text-lg font-medium'>Đang xử lý đăng nhập...</p>
//     </div>
//   );
// }

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-toastify';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
        const userEmail = user.email;
        const fullName = user.user_metadata?.full_name || '';
        const avatar = user.user_metadata?.avatar_url || '';

        const userData = {
          email: userEmail,
          fullName,
          photoURL: avatar,
        };

        // Lưu vào localStorage để Header có thể lấy ra hiển thị
        localStorage.setItem('custom-user', JSON.stringify(userData));

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
