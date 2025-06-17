import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllMatrices = async () => {
  return await axiosClient.get(`${API}/matrices`);
};

export { getAllMatrices };
