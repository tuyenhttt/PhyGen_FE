import { useState, useRef, useEffect, useCallback } from 'react';
import { FaBell, FaEnvelope, FaMoon, FaUserCircle } from 'react-icons/fa';
import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchInput from '@/components/ui/SearchInput';

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
            Chào mừng bạn đến với
            <span className='text-blue-600 font-bold'> PHYGEN</span>!
          </h1>
        ) : (
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      <div className='relative flex items-center gap-6'>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaMoon size={18} />
        </button>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaEnvelope size={18} />
        </button>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaBell size={18} />
        </button>

        <div className='relative' ref={dropdownRef}>
          <div
            className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow cursor-pointer hover:ring-2 hover:ring-blue-500 transition'
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
          </div>
          {isOpen && (
            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/10 z-50'>
              <button
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                onClick={handleNavigateProfile}
              >
                Hồ sơ cá nhân
              </button>
              <button
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer '
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
