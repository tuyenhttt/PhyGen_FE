import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '@/assets/images/logo.jpeg';
import { useAuth } from '@/contexts/AuthContext';
import RightControls from '@/components/layouts/RightControls';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={logo}
            alt='Logo'
            className='h-10 w-auto rounded-lg cursor-pointer'
            onClick={() => navigate('/')}
          />
          <nav className='hidden md:flex gap-6 font-medium'>
            {[
              '/',
              '/exam',
              '/question',
              '/matrix',
              '/curriculum',
              '/about',
            ].map((to, idx) => (
              <NavLink
                key={idx}
                to={to}
                className={({ isActive }) =>
                  `hover:text-indigo-600 transition ${
                    isActive ? 'text-indigo-600' : 'text-gray-700'
                  }`
                }
              >
                {
                  [
                    'Trang chủ',
                    'Đề thi',
                    'Câu hỏi',
                    'Ma trận',
                    'Khung chương trình ',
                    'Về chúng tôi',
                  ][idx]
                }
              </NavLink>
            ))}
          </nav>
        </div>

        <RightControls
          key={user?.email || 'guest'}
          user={user}
          loadingUser={loading}
          onLogout={logout}
        />
      </div>
    </header>
  );
};

export default memo(Header);
