import axiosClient from '@/services/axiosClient';

const register = async body => {
  return await axiosClient.post('/Auth/register', body);
};

const login = async ({ email, password }) => {
  return await axiosClient.post('/Auth/login', { email, password });
};

const updatepassword = async body => {
  return await axiosClient.post('/Auth/updatepassword', body);
};

export { register, login, updatepassword };
