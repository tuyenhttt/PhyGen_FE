import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllMatrices = async params => {
  return await axiosClient.get('/api/matrices', { params });
};

export { getAllMatrices };
