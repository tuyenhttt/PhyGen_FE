import { memo, useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import logo from '@/assets/images/logo.jpeg';
import { useAuth } from '@/contexts/AuthContext';
import RightControls from '@/components/layouts/RightControls';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen(v => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const links = [
    { to: '/', label: 'Trang chủ' },
    { to: '/exam', label: 'Đề thi' },
    { to: '/question', label: 'Câu hỏi' },
    { to: '/matrix', label: 'Ma trận' },
    { to: '/curriculum', label: 'Khung chương trình ' },
    { to: '/about', label: 'Về chúng tôi' },
  ];

  return (
    <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
      {/* Top bar */}
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Hamburger */}
          <button
            type='button'
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls='mobile-nav'
            onClick={toggle}
            className='md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-[.98] transition'
          >
            {open ? (
              <HiOutlineX className='text-2xl' />
            ) : (
              <HiOutlineMenu className='text-2xl' />
            )}
          </button>

          {/* Logo */}
          <img
            src={logo}
            alt='Logo'
            className='h-10 w-auto rounded-lg cursor-pointer select-none'
            onClick={() => navigate('/')}
          />

          {/* Desktop nav */}
          <nav className='hidden md:flex gap-6 font-medium ml-4'>
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `hover:text-indigo-600 transition ${
                    isActive ? 'text-indigo-600' : 'text-gray-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right controls*/}
        <RightControls
          key={user?.email || 'guest'}
          user={user}
          loadingUser={loading}
          onLogout={logout}
        />
      </div>

      {/* Mobile nav panel (renders only on mobile) */}
      <div
        id='mobile-nav'
        className={`md:hidden transition-[max-height,opacity] duration-300 ease-out overflow-hidden bg-white border-t border-gray-200 shadow-sm ${
          open ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 py-2'>
          <ul className='flex flex-col py-2'>
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={close}
                  className={({ isActive }) =>
                    `block w-full px-2 py-3 rounded-lg text-base font-medium transition ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
