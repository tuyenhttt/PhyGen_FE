import axiosClient from '@/services/axiosClient';

const register = async body => {
  return await axiosClient.post('/Auth/register', body);
};

export { register };
