import axiosClient from '@/services/axiosClient';

const getNotificationForUser = async userId => {
  return await axiosClient.get('api/notification', {
    params: { userId },
  });
};

const markAllNotificationsAsRead = async userId => {
  return await axiosClient.put('api/notification/maskasread', null, {
    params: { userId },
  });
};

const sendNotification = async ({ userId, title, content }) => {
  const params = {
    Title: title,
    Message: content,
  };

  if (userId) {
    params.UserId = userId;
  }

  return await axiosClient.post('api/notification', null, {
    params,
  });
};

export { getNotificationForUser, markAllNotificationsAsRead, sendNotification };
