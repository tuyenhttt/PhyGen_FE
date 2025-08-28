import axios from 'axios';
import Cookies from 'js-cookie';
import { forceLogout } from '@/utils/session';

const baseURL = import.meta.env.VITE_BASE_URL;

const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Gắn token vào request
axiosClient.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý response
axiosClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const status = err?.response?.status;
    const beMsg = err?.response?.data?.Message || err?.response?.data?.message;

    if (status === 403 || (status === 401 && /bị khóa/i.test(beMsg || ''))) {
      forceLogout(beMsg || 'Tài khoản đã bị khóa');
      return Promise.reject(err);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/refresh-token')
    ) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        forceLogout('Phiên đăng nhập đã hết hạn');
        return Promise.reject(err);
      }

      try {
        const { data } = await refreshClient.post('/refresh-token', {
          token: refreshToken,
        });

        Cookies.set('token', data.accessToken);
        Cookies.set('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        forceLogout('Phiên đăng nhập đã hết hạn');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
