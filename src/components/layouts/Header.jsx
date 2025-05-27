import { useState, useEffect, useRef } from 'react';
import logo from '@/assets/images/logo.jpeg';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { IoNotifications } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Auto close menu when clicking outside
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
    <header className='flex items-center justify-around px-6 py-4 shadow dark:text-black relative'>
      <div className='flex items-center gap-4'>
        <img alt='PhyGen' src={logo} className='h-10 w-auto rounded-lg' />
        <nav className='hidden md:flex gap-6 font-medium'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `hover:text-indigo-600 transition ${
                isActive ? 'text-indigo-600 ' : 'text-gray-700'
              }`
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to='/matrix'
            className={({ isActive }) =>
              `hover:text-indigo-600 transition ${
                isActive ? 'text-indigo-600 ' : 'text-gray-700'
              }`
            }
          >
            Ma trận & Câu hỏi
          </NavLink>
          <NavLink
            to='/exam-paper'
            className={({ isActive }) =>
              `hover:text-indigo-600 transition ${
                isActive ? 'text-indigo-600 ' : 'text-gray-700'
              }`
            }
          >
            Đề thi
          </NavLink>
          <NavLink
            to='/others'
            className={({ isActive }) =>
              `hover:text-indigo-600 transition ${
                isActive ? 'text-indigo-600 ' : 'text-gray-700'
              }`
            }
          >
            Khác
          </NavLink>
          <NavLink
            to='/about'
            className={({ isActive }) =>
              `hover:text-indigo-600 transition ${
                isActive ? 'text-indigo-600 ' : 'text-gray-700'
              }`
            }
          >
            Về chúng tôi
          </NavLink>
        </nav>
      </div>

      <div className='flex items-center gap-4'>
        {/* Search with icon */}
        <div className='relative hidden md:block'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
            <FiSearch />
          </span>
          <input
            type='text'
            placeholder='Tìm kiếm...'
            className='pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
          />
        </div>

        <button className='relative text-xl'>
          <IoNotifications className='text-3xl' />
        </button>

        {/* Toggle dark mode */}
        <label className='flex items-center cursor-pointer'>
          <div className='relative'>
            <input
              type='checkbox'
              className='sr-only'
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <div className='w-10 h-5 bg-gray-300 rounded-full shadow-inner dark:bg-gray-600' />
            <div
              className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 transform'
              style={{
                transform: darkMode ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </div>
        </label>

        {/* User Avatar + Menu */}
        {user ? (
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className='flex items-center focus:outline-none'
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt='User Avatar'
                  className='w-8 h-8 rounded-full border shadow-sm'
                />
              ) : (
                <FaRegUser className='text-3xl' />
              )}
            </button>

            {menuOpen && (
              <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden animate-fade-in'>
                <div className='absolute -top-2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200'></div>

                <div className='py-2'>
                  <Link
                    to='/'
                    className='block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition'
                    onClick={() => setMenuOpen(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-gray-100 transition'
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to='/login'
            className='px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm'
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
