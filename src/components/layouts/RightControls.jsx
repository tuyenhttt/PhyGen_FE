import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaRegUser, FaCoins } from 'react-icons/fa';
import { getUserProfile } from '@/services/userService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import NotificationDropdown from '@/components/layouts/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const RightControls = ({ loadingUser, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [userCoin, setUserCoin] = useState('');

  const fetchUserProfile = useCallback(async () => {
    if (user) {
      try {
        const response = await getUserProfile();
        setUserCoin(response.data.coin);
      } catch (err) {
        console.error('Lỗi tải xu:', err);
        toast.error(err.response?.data?.message || 'Không thể tải số xu.');
      }
    }
  }, []);

  useEffect(() => {
    const allowedPaths = ['/user', '/payment', '/payment/history'];
    if (user && allowedPaths.includes(location.pathname)) {
      fetchUserProfile();
    }
  }, [user, location.pathname, fetchUserProfile]);

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

      <div className='relative' ref={menuRef}>
        {loadingUser ? (
          <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
        ) : user ? (
          <>
            <div className='flex gap-4'>
              <button
                onClick={toggleMenu}
                className='flex items-center rounded-full'
              >
                {user.avatar || user.photoURL ? (
                  <img
                    src={user.avatar || user.photoURL}
                    alt='User Avatar'
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ) : (
                  <FaRegUser className='text-2xl text-gray-600' />
                )}
              </button>
              <p className='flex items-center gap-1'>
                Số xu: {userCoin}{' '}
                <FaCoins className='text-xl text-yellow-500' />
              </p>
            </div>
            {menuOpen && (
              <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30'>
                <Link
                  to='/user'
                  className='block px-4 py-2 text-sm hover:bg-blue-50'
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to='/payment'
                  className='block px-4 py-2 text-sm hover:bg-blue-50'
                  onClick={() => setMenuOpen(false)}
                >
                  Nạp xu
                </Link>
                <Link
                  to='/payment/history'
                  className='block px-4 py-2 text-sm hover:bg-blue-50'
                  onClick={() => setMenuOpen(false)}
                >
                  Lịch sử giao dịch
                </Link>
                <p
                  onClick={handleLogout}
                  className='cursor-pointer block px-4 py-2 text-sm  text-red-600 hover:bg-red-100'
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
