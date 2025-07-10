import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllMatrices = async params => {
  return await axiosClient.get('/api/matrices', { params });
};

const getMatrixById = async matrixId => {
  return await axiosClient.get(`/api/matrices/${matrixId}`, matrixId);
}

export { getAllMatrices, getMatrixById };
