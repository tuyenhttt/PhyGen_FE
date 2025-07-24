import axiosClient from '@/services/axiosClient';

const API = 'api/matrices';

const getAllMatrices = async (params = {}) => {
  const usp = new URLSearchParams();

  if (params.pageIndex != null) usp.append('pageIndex', params.pageIndex);
  if (params.pageSize != null) usp.append('pageSize', params.pageSize);

  if (Array.isArray(params.Grade)) {
    params.Grade.forEach(g => usp.append('Grade', g));
  }
  if (Array.isArray(params.Year)) {
    params.Year.forEach(y => usp.append('Year', y));
  }
  if (Array.isArray(params.ExamCategoryId)) {
    params.ExamCategoryId.forEach(e => usp.append('ExamCategoryId', e));
  }

  if (params.SubjectId) usp.append('SubjectId', params.SubjectId);
  if (params.Search) usp.append('Search', params.Search);
  if (params.Sort) usp.append('Sort', params.Sort);

  return await axiosClient.get(`${API}?${usp.toString()}`);
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

const updateMatrix = matrix => {
  return axiosClient.put('/api/matrices', matrix);
};

const updateMatrixSection = section =>
  axiosClient.put('/api/matrixsections', {
    id: section.id,
    matrixId: section.matrixId,
    title: section.title,
    score: section.score,
    description: section.description,
  });

const updateMatrixSectionDetails = detail =>
  axiosClient.put('/api/matrixsectiondetails', {
    id: detail.id,
    matrixSectionId: detail.matrixSectionId,
    sectionId: detail.sectionId,
    title: detail.title,
    description: detail.description,
    level: detail.level,
    type: detail.type,
    quantity: detail.quantity,
  });

export {
  getAllMatrices,
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
  deleteMatrix,
  updateMatrix,
  updateMatrixSection,
  updateMatrixSectionDetails,
};
