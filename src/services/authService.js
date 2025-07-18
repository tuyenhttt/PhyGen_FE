import axiosClient from '@/services/axiosClient';

const API = '/api/auths';

const register = async ({
  email,
  firstName,
  lastName,
  gender,
  password,
  confirmPassword,
}) => {
  return await axiosClient.post(`${API}/register`, {
    email,
    firstName,
    lastName,
    gender,
    password,
    confirmPassword,
  });
};

const login = async ({ email, password }) => {
  return await axiosClient.post(`${API}/login`, { email, password });
};

const confirmlogin = async ({ email, otptext }) => {
  return await axiosClient.post(`${API}/confirmlogin`, {
    email,
    otptext,
  });
};

const forgetpassword = async ({ email }) => {
  return await axiosClient.get(`${API}/forgetpassword`, {
    params: { email },
  });
};

const updatepassword = async body => {
  return await axiosClient.post(`${API}/updatepassword`, body);
};

const changePassword = async ({
  email,
  currentPassword,
  newPassword,
  confirmNewPassword,
}) => {
  return await axiosClient.post(`${API}/change-password`, {
    email,
    currentPassword,
    newPassword,
    confirmNewPassword,
  });
};

export {
  register,
  login,
  updatepassword,
  confirmlogin,
  forgetpassword,
  changePassword,
};
