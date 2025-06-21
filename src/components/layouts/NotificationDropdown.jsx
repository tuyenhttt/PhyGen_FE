import { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import Cookies from 'js-cookie';
import {
  getNotificationForUser,
  markAllNotificationsAsRead,
} from '@/services/notificationService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userCookie = Cookies.get('custom-user');
      console.log('User cookie (raw):', userCookie);
      if (!userCookie) return;

      const user = JSON.parse(userCookie);
      const userId = user?.id;
      console.log('Parsed user:', user);
      console.log('User ID:', user?.id);

      try {
        const res = await getNotificationForUser(userId);
        console.log('API raw data:', res.data);

        const raw = res.data?.data?.data;
        const data = Array.isArray(raw) ? raw : [];

        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(sorted);
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                setNotifications(prev =>
                  prev.map(n => ({
                    ...n,
                    isRead: true,
                  }))
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

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        className='relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
        onClick={toggleDropdown}
      >
        <FiBell
          className={`h-6 w-6 text-gray-600 ${
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
        <div className='absolute right-0 mt-2 w-96 max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden'>
          <div className='p-4 font-semibold border-b border-gray-100 text-gray-800 text-lg'>
            Thông báo
          </div>
          {notifications.length === 0 ? (
            <div className='p-4 text-sm text-gray-500'>Không có thông báo.</div>
          ) : (
            <ul className='max-h-96 overflow-y-auto divide-y divide-gray-100 scroll-smooth'>
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
                      <span className='ml-2 h-2 w-2 bg-red-500 rounded-full'></span>
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
