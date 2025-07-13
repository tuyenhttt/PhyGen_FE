import axiosClient from '@/services/axiosClient';

const API = 'api/matrices';

const getAllMatrices = async params => {
  return await axiosClient.get(`${API}`, { params });
};

const getMatrixById = async matrixId => {
  return await axiosClient.get(`${API}/${matrixId}`, matrixId);
};

export { getAllMatrices, getMatrixById };
