import React, { useState, useEffect, useRef } from 'react';
import { IoNotifications } from 'react-icons/io5';
import { supabase } from '@/supabase/supabaseClient';
import Cookies from 'js-cookie';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userCookie = Cookies.get('custom-user');
      if (!userCookie) return;
      const user = JSON.parse(userCookie);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setNotifications(data || []);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const userCookie = Cookies.get('custom-user');
    if (!userCookie) return;
    const user = JSON.parse(userCookie);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
  };

  const toggleDropdown = () => {
    setOpen(!open);
    if (!open) markAllAsRead();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className='relative' ref={dropdownRef}>
      <IoNotifications
        className='text-2xl cursor-pointer'
        onClick={toggleDropdown}
      />
      {unreadCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1'>
          {unreadCount}
        </span>
      )}

      {open && (
        <div className='absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl z-50 border border-gray-200'>
          {notifications.length === 0 ? (
            <p className='p-4 text-gray-500 text-sm'>Không có thông báo</p>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 border-b hover:bg-gray-50 ${
                  !notif.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <p className='text-sm font-medium'>{notif.title}</p>
                <p className='text-xs text-gray-500'>{notif.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
