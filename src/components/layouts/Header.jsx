import React, { memo, useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/images/logo.jpeg';
import { supabase } from '@/supabase/supabaseClient';
import RightControls from '@/components/layouts/RightControls';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          email: authUser.email,
          photoURL: authUser.user_metadata?.avatar_url || null,
          fullName: authUser.user_metadata?.full_name || null,
        });
      } else {
        const customUserStr = localStorage.getItem('custom-user');
        if (customUserStr) {
          setUser(JSON.parse(customUserStr));
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const handleLogoutCleanup = useCallback(() => {
    setUser(null);
    localStorage.removeItem('custom-user');
  }, []);

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email,
            photoURL: session.user.user_metadata?.avatar_url || null,
            fullName: session.user.user_metadata?.full_name || null,
          });
        } else {
          const customUserStr = localStorage.getItem('custom-user');
          if (customUserStr) {
            setUser(JSON.parse(customUserStr));
          } else {
            setUser(null);
          }
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [loadUser]);

  return (
    <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        {/* Logo + Nav */}
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

        {/* Controls bên phải */}
        <RightControls
          user={user}
          loadingUser={loadingUser}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogoutCleanup}
        />
      </div>
    </header>
  );
};

export default memo(Header);
