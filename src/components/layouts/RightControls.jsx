import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoNotifications } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { supabase } from '@/supabase/supabaseClient';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const RightControls = ({ loadingUser, darkMode, toggleDarkMode, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Load user từ cookie khi component mount
  useEffect(() => {
    const userCookie = Cookies.get('custom-user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    onLogout?.();
    Cookies.remove('custom-user');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
    toast.success('Đăng xuất thành công');
  }, [navigate, onLogout]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

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
      {/* Search */}
      <div className='hidden md:block relative'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
          <FiSearch />
        </span>
        <input
          type='text'
          placeholder='Tìm kiếm...'
          className='pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
        />
      </div>

      <IoNotifications className='text-2xl cursor-pointer' />

      {/* Dark mode toggle */}
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

      {/* Avatar hoặc nút đăng nhập */}
      <div className='relative' ref={menuRef}>
        {loadingUser ? (
          <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
        ) : user ? (
          <>
            <button
              onClick={toggleMenu}
              className='flex items-center focus:outline-none'
              aria-haspopup='true'
              aria-expanded={menuOpen}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt='User Avatar'
                  className='w-8 h-8 rounded-full border shadow-sm object-cover'
                />
              ) : (
                <FaRegUser className='text-2xl' />
              )}
            </button>
            {menuOpen && (
              <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border z-30'>
                <Link
                  to='/user'
                  className='block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100'
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <p
                  onClick={handleLogout}
                  className='w-full cursor-pointer text-left px-4 py-2 text-sm text-red-800 hover:bg-gray-100'
                >
                  Đăng xuất
                </p>
              </div>
            )}
          </>
        ) : (
          <PrimaryButton onClick={handleLogin}>Đăng nhập</PrimaryButton>
        )}
      </div>
    </div>
  );
};

export default React.memo(RightControls);
