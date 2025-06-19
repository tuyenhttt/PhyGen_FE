import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_BASE_URL;

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async config => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

axiosClient.interceptors.response.use(
  res => {
    return res;
  },
  async err => {
    const originalRequest = err.config;

    if (err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');

      if (!refreshToken) return Promise.reject(err);

      try {
        const res = await axiosClient.post('/refresh-token', {
          token: refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        Cookies.set('token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (error) {
        Cookies.remove('token');
        Cookies.remove('refreshToken');

        return Promise.reject(new Error(error?.message || 'Unknown error'));
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
