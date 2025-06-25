import axiosClient from '@/services/axiosClient';

const API = '/api/users';

const getUserProfile = async () => {
  return await axiosClient.get(`${API}/profile`);
};

const updateUserProfile = async userData => {
  return await axiosClient.put(`${API}/profile`, userData);
};

const lockUserById = async userId => {
  return await axiosClient.put(`${API}/lock`, null, {
    params: { UserId: userId },
  });
};

const unlockUserById = async userId => {
  return await axiosClient.put(`${API}/unlock`, null, {
    params: { UserId: userId },
  });
};

const getAllUserProfile = async (pageIndex = 1, pageSize = 10) => {
  return axiosClient.get(
    `/api/users/getAllProfiles?pageIndex=${pageIndex}&pageSize=${pageSize}`
  );
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
  unlockUserById,
};
