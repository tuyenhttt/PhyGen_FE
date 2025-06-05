import axiosClient from '@/services/axiosClient';

const API = '/api/Auth';

const register = async ({ email, password, confirmPassword }) => {
  return await axiosClient.post(`${API}/register`, {
    email,
    password,
    confirmPassword,
  });
};

const confirmlogin = async ({ email, otptext }) => {
  return await axiosClient.post(`${API}/confirmlogin`, {
    email,
    otptext,
  });
};

const login = async ({ email, password }) => {
  return await axiosClient.post(`${API}/login`, { email, password });
};

const forgetpassword = async ({ email }) => {
  return await axiosClient.get(`${API}/forgetpassword`, {
    params: { email },
  });
};

const updatepassword = async body => {
  return await axiosClient.post(`${API}/updatepassword`, body);
};

export { register, login, updatepassword, confirmlogin, forgetpassword };
