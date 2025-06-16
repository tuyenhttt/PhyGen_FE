import axiosClient from '@/services/axiosClient';

const getNotificationForUser = async userId => {
  return await axiosClient.get('/api/notification', {
    params: { userId },
  });
};

export { getNotificationForUser };
