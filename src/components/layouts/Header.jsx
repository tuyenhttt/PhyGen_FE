// import { useState, useEffect, useRef, memo } from 'react';
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import { IoNotifications } from 'react-icons/io5';
// import { FiSearch } from 'react-icons/fi';
// import { FaRegUser } from 'react-icons/fa';
// import { supabase } from '@/supabase/supabaseClient';
// import PrimaryButton from '@/components/ui/PrimaryButton';
// import logo from '@/assets/images/logo.jpeg';
// import { toast } from 'react-toastify';

// const Header = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);
//   const navigate = useNavigate();

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle('dark', !darkMode);
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     localStorage.removeItem('custom-user');
//     setUser(null);
//     setMenuOpen(false);
//     navigate('/');
//     toast.success('Đăng xuất thành công');
//   };

//   const handleLogin = () => {
//     navigate('/login');
//   };

//   const loadUser = async () => {
//     const customUserStr = localStorage.getItem('custom-user');
//     if (customUserStr) {
//       setUser(JSON.parse(customUserStr));
//       setLoadingUser(false);
//       return;
//     }

//     try {
//       const {
//         data: { user: authUser },
//       } = await supabase.auth.getUser();

//       if (authUser) {
//         const userData = {
//           email: authUser.email,
//           photoURL: authUser.user_metadata?.avatar_url || null,
//           fullName: authUser.user_metadata?.full_name || null,
//         };
//         setUser(userData);
//         localStorage.setItem('custom-user', JSON.stringify(userData));
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Error loading user:', error);
//       setUser(null);
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   useEffect(() => {
//     loadUser();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         if (session?.user) {
//           setUser({
//             email: session.user.email,
//             photoURL: session.user.user_metadata?.avatar_url || null,
//             fullName: session.user.user_metadata?.full_name || null,
//           });
//         } else {
//           // Nếu logout Supabase, thử lấy lại user backend từ localStorage
//           const customUserStr = localStorage.getItem('custom-user');
//           if (customUserStr) {
//             setUser(JSON.parse(customUserStr));
//           } else {
//             setUser(null);
//           }
//         }
//       }
//     );

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   // Đóng menu khi click ngoài
//   useEffect(() => {
//     const handleClickOutside = e => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <header className='fixed top-0 left-0 right-0 bg-white shadow z-50'>
//       <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
//         {/* Logo + Nav */}
//         <div className='flex items-center gap-4'>
//           <img src={logo} alt='PhyGen' className='h-10 w-auto rounded-lg' />
//           <nav className='hidden md:flex gap-6 font-medium'>
//             {['/', '/matrix', '/question', '/exam', '/about'].map((to, idx) => (
//               <NavLink
//                 key={idx}
//                 to={to}
//                 className={({ isActive }) =>
//                   `hover:text-indigo-600 transition ${
//                     isActive ? 'text-indigo-600' : 'text-gray-700'
//                   }`
//                 }
//               >
//                 {
//                   ['Trang chủ', 'Ma trận', 'Câu hỏi', 'Đề thi', 'Về chúng tôi'][
//                     idx
//                   ]
//                 }
//               </NavLink>
//             ))}
//           </nav>
//         </div>

//         {/* Right controls */}
//         <div className='flex items-center gap-4'>
//           <div className='hidden md:block relative'>
//             <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
//               <FiSearch />
//             </span>
//             <input
//               type='text'
//               placeholder='Tìm kiếm...'
//               className='pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
//             />
//           </div>

//           <IoNotifications className='text-2xl cursor-pointer' />

//           <label className='cursor-pointer'>
//             <div className='relative'>
//               <input
//                 type='checkbox'
//                 className='sr-only'
//                 checked={darkMode}
//                 onChange={toggleDarkMode}
//               />
//               <div className='w-10 h-5 bg-gray-300 rounded-full dark:bg-gray-600' />
//               <div
//                 className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200'
//                 style={{
//                   transform: darkMode ? 'translateX(20px)' : 'translateX(0)',
//                 }}
//               />
//             </div>
//           </label>

//           {/* Avatar / Đăng nhập */}
//           <div className='relative' ref={menuRef}>
//             {loadingUser ? (
//               <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
//             ) : user ? (
//               <>
//                 <button
//                   onClick={() => setMenuOpen(prev => !prev)}
//                   className='flex items-center focus:outline-none'
//                 >
//                   {user.photoURL ? (
//                     <img
//                       src={user.photoURL}
//                       alt='User Avatar'
//                       className='w-8 h-8 rounded-full border shadow-sm object-cover'
//                     />
//                   ) : (
//                     <FaRegUser className='text-2xl' />
//                   )}
//                 </button>
//                 {menuOpen && (
//                   <div className='absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border z-30'>
//                     <Link
//                       to='/'
//                       className='block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100'
//                       onClick={() => setMenuOpen(false)}
//                     >
//                       Hồ sơ cá nhân
//                     </Link>
//                     <p
//                       onClick={handleLogout}
//                       className='w-full cursor-pointer text-left px-4 py-2 text-sm text-red-800 hover:bg-gray-100'
//                     >
//                       Đăng xuất
//                     </p>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <PrimaryButton onClick={handleLogin}>Đăng nhập</PrimaryButton>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default memo(Header);

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
        />
      </div>
    </header>
  );
};

export default memo(Header);
