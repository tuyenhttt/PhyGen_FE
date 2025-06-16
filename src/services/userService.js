import axiosClient from '@/services/axiosClient';

const API = '/api/User';

const getUserProfile = async () => {
  return await axiosClient.get(`${API}/profile`);
};

const updateUserProfile = async userData => {
  return await axiosClient.put(`${API}/profile`, userData);
};

const getAllUserProfile = async () => {
  return await axiosClient.get(`${API}/getAllProfiles`);
};

const getUserProfileById = async id => {
  return await axiosClient.get(`${API}/profile/${id}`);
};

export {
  getUserProfile,
  updateUserProfile,
  getAllUserProfile,
  getUserProfileById,
};
