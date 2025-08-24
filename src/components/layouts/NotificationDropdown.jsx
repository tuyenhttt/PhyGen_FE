import { useEffect, useRef, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  getNotificationForUser,
  markAllNotificationsAsRead,
} from '@/services/notificationService';
import { IoNotifications } from 'react-icons/io5';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const userCookie = Cookies.get('custom-user');
    if (!userCookie) return;

    const user = JSON.parse(userCookie);
    const userId = user?.id;

    try {
      const res = await getNotificationForUser(userId);
      const raw = res.data?.data?.data;
      const data = Array.isArray(raw) ? raw : [];
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sorted);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
  }, []);

 useEffect(() => {
  fetchNotifications();
}, []);

  // Click outside (dùng 'click' và bỏ qua nút chuông)
  useEffect(() => {
    const handleClickOutside = e => {
      if (!isOpen) return;
      const panel = dropdownRef.current;
      const btn = toggleBtnRef.current;
      if (
        panel &&
        !panel.contains(e.target) &&
        btn &&
        !btn.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEsc = e => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(prev => {
      const willOpen = !prev;

      if (willOpen) {
        const userCookie = Cookies.get('custom-user');
        if (userCookie) {
          const user = JSON.parse(userCookie);
          const userId = user?.id;
          if (userId) {
            markAllNotificationsAsRead(userId)
              .then(() => {
                setNotifications(prevList =>
                  prevList.map(n => ({ ...n, isRead: true }))
                );
              })
              .catch(err =>
                console.error('Lỗi khi đánh dấu thông báo đã đọc:', err)
              );
          }
        }
      }

      return willOpen;
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handler = () => {
      fetchNotifications();
    };
    window.addEventListener('refresh-notification', handler);
    return () => window.removeEventListener('refresh-notification', handler);
  }, [fetchNotifications]);

  return (
    <div className='relative'>
      <button
        ref={toggleBtnRef}
        className='relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        aria-label='Thông báo'
      >
        <IoNotifications
          className={`h-6 w-6 text-gray-500 ${
            unreadCount > 0 ? 'animate-bounce' : ''
          }`}
        />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full shadow'>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role='menu'
          // Mobile: fixed, canh giữa theo viewport. >=sm: absolute như cũ.
          className='
            fixed inset-x-3 top-14 z-50
            sm:absolute sm:inset-auto sm:right-0 sm:mt-2
            bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden
            w-auto sm:w-96 max-w-sm
          '
        >
          <div className='p-4 font-semibold border-b border-gray-100 text-gray-800 text-lg'>
            Thông báo
          </div>

          {notifications.length === 0 ? (
            <div className='p-4 text-sm text-gray-500'>Không có thông báo.</div>
          ) : (
            <ul className='max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-gray-100 scroll-smooth'>
              {notifications.map(noti => (
                <li
                  key={noti.id}
                  className={`p-4 text-sm transition-all duration-200 cursor-pointer
                    ${
                      noti.isRead
                        ? 'bg-gray-50 text-gray-600'
                        : 'bg-white font-medium text-gray-900'
                    }
                    hover:bg-blue-50 hover:text-blue-900`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-md font-bold'>{noti.title}</span>
                    {!noti.isRead && (
                      <span className='ml-2 h-2 w-2 bg-red-500 rounded-full' />
                    )}
                  </div>
                  <div className='text-gray-700 text-sm mt-1'>
                    {noti.message}
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {new Date(noti.createdAt).toLocaleString('vi-VN')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
