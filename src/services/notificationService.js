import axiosClient from '@/services/axiosClient';

const getNotificationForUser = async userId => {
  return await axiosClient.get('api/notification', {
    params: { userId },
  });
};

const markAllNotificationsAsRead = async userId => {
  return axiosClient.put('api/notification/maskasread', null, {
    params: { userId },
  });
};

export { getNotificationForUser, markAllNotificationsAsRead };
