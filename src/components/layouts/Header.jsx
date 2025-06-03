import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { IoNotifications } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import PrimaryButton from '@/components/ui/PrimaryButton';
import logo from '@/assets/images/logo.jpeg';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = async () => {
    if (auth.currentUser?.uid?.startsWith('backend-')) {
      auth.currentUser = null;
      setUser(null);
      window.dispatchEvent(new Event('auth-fake-logout'));
    } else {
      await signOut(auth);
      setUser(null);
    }
    setMenuOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    const handleFakeLogin = () => {
      setUser(auth.currentUser);
      setLoadingUser(false);
    };

    const handleFakeLogout = () => {
      setUser(null);
      setLoadingUser(false);
    };

    window.addEventListener('auth-fake-login', handleFakeLogin);
    window.addEventListener('auth-fake-logout', handleFakeLogout);

    return () => {
      unsubscribe();
      window.removeEventListener('auth-fake-login', handleFakeLogin);
      window.removeEventListener('auth-fake-logout', handleFakeLogout);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        {/* Logo + Nav */}
        <div className='flex items-center gap-4'>
          <img src={logo} alt='PhyGen' className='h-10 w-auto rounded-lg' />
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

        {/* Right controls */}
        <div className='flex items-center gap-4'>
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

          {/* Avatar / Đăng nhập */}
          <div className='relative' ref={menuRef}>
            {loadingUser ? (
              <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
            ) : user ? (
              <>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className='flex items-center focus:outline-none'
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
                      to='/'
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
              <PrimaryButton
                className='px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm'
                onClick={handleLogin}
              >
                Đăng nhập
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenu && (
        <div className='md:hidden bg-white shadow px-4 py-3 space-y-2'>
          {['/', '/matrix', '/exam-paper', '/others', '/about'].map(
            (to, idx) => (
              <NavLink
                key={idx}
                to={to}
                onClick={() => setMobileMenu(false)}
                className={({ isActive }) =>
                  `block text-sm py-1 ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-gray-700'
                  }`
                }
              >
                {
                  [
                    'Trang chủ',
                    'Ma trận & Câu hỏi',
                    'Đề thi',
                    'Khác',
                    'Về chúng tôi',
                  ][idx]
                }
              </NavLink>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
