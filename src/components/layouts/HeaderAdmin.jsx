import { useState, useRef, useEffect, useCallback } from 'react';
import { FaEnvelope, FaMoon, FaUserCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchInput from '@/components/ui/SearchInput';
import NotificationDropdown from '@/components/layouts/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';

const HeaderAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const isDashboard = location.pathname === '/admin';

  const { user, logout } = useAuth();

  const handleAvatarClick = () => setIsOpen(!isOpen);

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate('/admin/profile');
  };

  const handleLogout = useCallback(async () => {
    await logout();
    toast.success('Đăng xuất thành công');
    setIsOpen(false);
    navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className='h-20 bg-white shadow-sm px-6 flex items-center justify-between fixed top-0 left-64 w-[calc(100%-16rem)] z-40'>
      <div className='flex-1'>
        {isDashboard ? (
          <h1 className='text-lg font-bold text-gray-800'>
            Chào mừng bạn đến với{' '}
            <span className='text-blue-600 font-bold'>PHYGEN</span>!
          </h1>
        ) : (
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      <div className='relative flex items-center gap-6'>
        <button className='text-gray-500 p-2 rounded-full hover:bg-gray-100 transition'>
          <FaMoon size={22} />
        </button>
        <button className='text-gray-500 p-2 rounded-full hover:bg-gray-100 transition'>
          <FaEnvelope size={22} />
        </button>
        {user && <NotificationDropdown />}

        <div className='relative' ref={dropdownRef}>
          <button
            className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow cursor-pointer'
            onClick={handleAvatarClick}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt='Avatar'
                className='w-full h-full object-cover'
              />
            ) : (
              <FaUserCircle size={20} className='text-gray-600' />
            )}
          </button>
          {isOpen && (
            <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden'>
              <div
                className='block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer'
                onClick={handleNavigateProfile}
              >
                Hồ sơ cá nhân
              </div>
              <p
                onClick={handleLogout}
                className='cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-100'
              >
                Đăng xuất
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
