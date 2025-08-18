import axiosClient from '@/services/axiosClient';

const API = 'api/matrices';

const getAllMatrices = async (params = {}) => {
  const usp = new URLSearchParams();

  if (params.pageIndex != null) usp.append('PageIndex', params.pageIndex);
  if (params.pageSize != null) usp.append('PageSize', params.pageSize);

  if (params.SubjectId) usp.append('SubjectId', params.SubjectId);
  if (params.ExamCategoryId)
    usp.append('ExamCategoryId', params.ExamCategoryId);

  if (Array.isArray(params.ExamCategory)) {
    params.ExamCategory.forEach(e => usp.append('ExamCategory', e));
  }

  if (Array.isArray(params.Grade)) {
    params.Grade.forEach(g => usp.append('Grade', g));
  } else if (params.Grade) {
    usp.append('Grade', params.Grade); // 1 giá trị cũng ok
  }

  if (Array.isArray(params.Year)) {
    params.Year.forEach(y => usp.append('Year', y));
  } else if (params.Year) {
    usp.append('Year', params.Year);
  }

  if (params.Search) usp.append('Search', params.Search);
  if (params.Sort) usp.append('Sort', params.Sort);

  return axiosClient.get(`${API}?${usp.toString()}`);
};

const getMatrixById = async matrixId => {
  return await axiosClient.get(`${API}`, {
    params: { matrixId },
  });
};

const postMatrices = async params => {
  return await axiosClient.post(`${API}`, params);
};

const postMatrixSection = async params => {
  return await axiosClient.post(`/api/matrixsections`, params);
};

const postMatrixSectionDetail = async params => {
  return await axiosClient.post(`/api/matrixsectiondetails`, params);
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

const updateMatrix = (id, payload) =>
  axiosClient.put(`/api/matrices/${id}`, payload);

const updateMatrixbyId = (matrixId, data) => {
  return axiosClient.put(`${API}/${matrixId}`, data);
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

const getContentItems = subjectId =>
  axiosClient.get('/api/contentitems', { params: { SubjectId: subjectId } });

const updateStatusMatrix = (id, status) => {
  return axiosClient.patch(`/api/matrices/${id}/status`, { id, status });
};

export {
  getAllMatrices,
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
  deleteMatrix,
  updateMatrix,
  updateMatrixbyId,
  updateMatrixSection,
  updateMatrixSectionDetails,
  postMatrices,
  postMatrixSection,
  postMatrixSectionDetail,
  getContentItems,
  updateStatusMatrix,
};
