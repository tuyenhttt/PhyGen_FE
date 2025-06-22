import { useState, useRef, useEffect, useCallback } from 'react';
import { FaBell, FaEnvelope, FaMoon, FaUserCircle } from 'react-icons/fa';
import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchInput from '@/components/ui/SearchInput';
import NotificationDropdown from '@/components/layouts/NotificationDropdown';

const HeaderAdmin = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const isDashboard = location.pathname === '/admin';

  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate('/admin/profile');
  };

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    onLogout?.();
    Cookies.remove('custom-user');
    Cookies.remove('token');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
    toast.success('Đăng xuất thành công');
  }, [navigate, onLogout]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = Cookies.get('custom-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Lỗi khi parse user từ cookie:', error);
      }
    }
  }, []);

  return (
    <header className='h-20 bg-white shadow-sm px-6 flex items-center justify-between fixed top-0 left-64 w-[calc(100%-16rem)] z-40'>
      <div className='flex-1'>
        {isDashboard ? (
          <h1 className='text-lg font-bold text-gray-800'>
            Chào mừng bạn đến với {''}
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
        <button className='hover:bg-gray-100 text-gray-500 transition-colors duration-200'>
          <FaMoon size={22} />
        </button>
        <button className='hover:bg-gray-100 text-gray-500 transition-colors duration-200'>
          <FaEnvelope size={22} />
        </button>
        {user && <NotificationDropdown />}

        <div className='relative' ref={dropdownRef}>
          <button
            className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow cursor-pointer transition'
            onClick={handleAvatarClick}
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
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
                className='block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 transition-colors duration-200 cursor-pointer'
                onClick={handleNavigateProfile}
              >
                Hồ sơ cá nhân
              </div>
              <p
                onClick={handleLogout}
                className='cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors duration-200'
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
