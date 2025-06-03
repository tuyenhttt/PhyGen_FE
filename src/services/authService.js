import axiosClient from '@/services/axiosClient';

const register = async ({ email, password, confirmPassword }) => {
  return await axiosClient.post('/Auth/register', {
    email,
    password,
    confirmPassword,
  });
};

const confirmlogin = async ({ email, otptext }) => {
  return await axiosClient.post('/Auth/confirmlogin', {
    email,
    otptext,
  });
};

const login = async ({ email, password }) => {
  return await axiosClient.post('/Auth/login', { email, password });
};

const forgetpassword = async ({ email }) => {
  return await axiosClient.get('/Auth/forgetpassword', {
    params: { email },
  });
};

const updatepassword = async body => {
  return await axiosClient.post('/Auth/updatepassword', body);
};

export { register, login, updatepassword, confirmlogin, forgetpassword };
