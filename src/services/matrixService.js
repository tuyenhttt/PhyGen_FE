import axiosClient from '@/services/axiosClient';

const API = 'api/matrices';

const getAllMatrices = async params => {
  return await axiosClient.get(`${API}`, { params });
};

const getMatrixById = async matrixId => {
  return await axiosClient.get(`${API}/${matrixId}`, matrixId);
};

const getMatrixSection = async ({ matrixId }) => {
  return await axiosClient.get(`/api/matrixsections/matrix/${matrixId}`);
};

const getMatrixSectionDetail = async matrixSectionId => {
  return await axiosClient.get(
    `/api/matrixsectiondetails/matrixsection/${matrixSectionId}`
  );
};

export {
  getAllMatrices,
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
};
