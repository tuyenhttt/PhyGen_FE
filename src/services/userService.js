import axiosClient from '@/services/axiosClient';

const API = '/api/User';

const getUserProfile = async () => {
  return await axiosClient.get(`${API}/profile`);
};

const updateUserProfile = async userData => {
  return await axiosClient.put(`${API}/profile`, userData);
};

const lockUserById = async userId => {
  return await axiosClient.put(`api/User/lock`, null, {
    params: { UserId: userId },
  });
};

const unockUserById = async userId => {
  return await axiosClient.put(`api/User/unlock`, null, {
    params: { UserId: userId },
  });
};

const getAllUserProfile = async (filters = {}) => {
  return await axiosClient.get(`${API}/getAllProfiles`, {
    params: filters,
  });
};

const getUserProfileById = async id => {
  return await axiosClient.get(`${API}/getAllProfiles`, {
    params: { id },
  });
};

export {
  getUserProfile,
  updateUserProfile,
  getAllUserProfile,
  getUserProfileById,
  lockUserById,
  unockUserById,
};
