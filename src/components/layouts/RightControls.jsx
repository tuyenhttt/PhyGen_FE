import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegUser } from 'react-icons/fa';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import NotificationDropdown from '@/components/layouts/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';

const RightControls = ({ loadingUser, darkMode, toggleDarkMode, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  const handleLogout = useCallback(() => {
    onLogout?.();
    setMenuOpen(false);
    navigate('/');
  }, [navigate, onLogout]);

  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleRegister = useCallback(() => navigate('/register'), [navigate]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='flex items-center gap-4'>
      {user && <NotificationDropdown />}

      <label className='cursor-pointer'>
        <div className='relative'>
          <input
            type='checkbox'
            className='sr-only'
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <div className='w-10 h-5 bg-gray-300 rounded-full dark:bg-gray-600' />
          <div
            className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200'
            style={{
              transform: darkMode ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </div>
      </label>

      <div className='relative' ref={menuRef}>
        {loadingUser ? (
          <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
        ) : user ? (
          <>
            <button
              onClick={toggleMenu}
              className='flex items-center rounded-full'
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt='User Avatar'
                  className='w-8 h-8 rounded-full object-cover'
                />
              ) : (
                <FaRegUser className='text-2xl text-gray-600' />
              )}
            </button>
            {menuOpen && (
              <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30'>
                <Link
                  to='/user'
                  className='block px-4 py-2 text-sm hover:bg-blue-50'
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <p
                  onClick={handleLogout}
                  className='cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-100'
                >
                  Đăng xuất
                </p>
              </div>
            )}
          </>
        ) : (
          <div className='flex gap-4'>
            <PrimaryButton onClick={handleLogin}>Đăng nhập</PrimaryButton>
            <CommonButton onClick={handleRegister}>Đăng ký</CommonButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightControls;
