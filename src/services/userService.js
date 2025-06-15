import axiosClient from '@/services/axiosClient';

const API = '/api/User';

const getUserProfile = async () => {
  return await axiosClient.get(`${API}/profile`);
};

const updateUserProfile = async (userData) => {
  return await axiosClient.put(`${API}/profile`, userData);
};

export { getUserProfile, updateUserProfile };