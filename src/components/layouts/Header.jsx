import { memo, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/images/logo.jpeg';
import RightControls from '@/components/layouts/RightControls';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout, isLoading } = useAuth();

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  }, []);

  return (
    <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <img src={logo} alt='Logo' className='h-10 w-auto rounded-lg' />
          <nav className='hidden md:flex gap-6 font-medium'>
            {['/', '/matrix', '/question', '/exam', '/about'].map((to, idx) => (
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
                  ['Trang chủ', 'Ma trận', 'Câu hỏi', 'Đề thi', 'Về chúng tôi'][
                    idx
                  ]
                }
              </NavLink>
            ))}
          </nav>
        </div>

        <RightControls
          user={user}
          loadingUser={isLoading}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={logout}
        />
      </div>
    </header>
  );
};

export default memo(Header);
