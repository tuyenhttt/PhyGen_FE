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

const getAllUserProfile = async (pageIndex = 1, pageSize = 10, params = {}) => {
  const usp = new URLSearchParams();

  usp.append('pageIndex', pageIndex);
  usp.append('pageSize', pageSize);

  if (params.search) usp.append('search', params.search);
  if (params.role) usp.append('role', params.role);
  if (params.status) usp.append('status', params.status);
  if (params.confirm) usp.append('confirm', params.confirm);
  if (params.fromDate) usp.append('fromDate', params.fromDate);
  if (params.toDate) usp.append('toDate', params.toDate);

  return axiosClient.get(`/api/users/getAllProfiles?${usp.toString()}`);
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
