import axiosClient from '@/services/axiosClient';

const API = 'api/matrices';

const getAllMatrices = async params => {
  return await axiosClient.get(`${API}`, { params });
};

const getMatrixById = async matrixId => {
  return await axiosClient.get(`${API}`, {
    params: { matrixId },
  });
};

const getMatrixSection = async ({ matrixId }) => {
  return await axiosClient.get(`/api/matrixsections/matrix`, {
    params: { matrixId },
  });
};

const getMatrixSectionDetail = async matrixSectionId => {
  return await axiosClient.get(`/api/matrixsectiondetails/matrixsection`, {
    params: { matrixSectionId },
  });
};

const deleteMatrix = async matrixId => {
  return await axiosClient.delete(`${API}`, {
    data: { id: matrixId },
  });
};

export {
  getAllMatrices,
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
  deleteMatrix,
};
