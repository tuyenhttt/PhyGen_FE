import axiosClient from '@/services/axiosClient';

const API = 'api/exams';

const getAllExams = async (params = {}) => {
  const usp = new URLSearchParams();

  if (params.pageIndex != null) usp.append('pageIndex', params.pageIndex);
  if (params.pageSize != null) usp.append('pageSize', params.pageSize);

  if (Array.isArray(params.Grade)) {
    params.Grade.forEach(g => usp.append('Grade', g));
  }
  if (Array.isArray(params.Year)) {
    params.Year.forEach(y => usp.append('Year', y));
  }
  if (Array.isArray(params.ExamCategory)) {
    params.ExamCategory.forEach(e => usp.append('ExamCategory', e));
  }

  if (params.ExamCategoryId) usp.append('SubjectId', params.ExamCategoryId);
  if (params.Search) usp.append('Search', params.Search);
  if (params.Sort) usp.append('Sort', params.Sort);

  return await axiosClient.get(`${API}?${usp.toString()}`);
};

const getExamCategory = async () => {
  return await axiosClient.get(`/api/examcategories`);
};

const getExamByCategoryById = async examCategoryId => {
  return await axiosClient.get(`/api/examcategories/${examCategoryId}`);
};

const getExamById = async examId => {
  return await axiosClient.get(`${API}/${examId}`);
};

const getExamCountByGrade = async grade => {
  return await axiosClient.get(`${API}`, {
    params: { Grade: [grade] },
  });
};

const postExam = async ({
  examCategoryId,
  userId,
  title,
  description,
  grade,
  year,
  totalQuestionCount,
  versionCount,
  randomizeQuestions,
}) => {
  return await axiosClient.post(`${API}`, {
    examCategoryId,
    userId,
    title,
    description,
    grade,
    year,
    totalQuestionCount,
    versionCount,
    randomizeQuestions,
  });
};

const generateAutoExam = async matrixData => {
  return await axiosClient.post(`${API}/generate`, matrixData, {
    timeout: 300000,
  });
};

const postExamCategory = body => axiosClient.post('/api/examcategories', body);

const updateExamCategory = payload =>
  axiosClient.put('/api/examcategories', payload);

const deleteExamCategory = id =>
  axiosClient.delete('/api/examcategories', { data: { id } });

const putExam = async ({
  examCategoryId,
  userId,
  title,
  description,
  grade,
  year,
  totalQuestionCount,
  versionCount,
  randomizeQuestions,
}) => {
  return await axiosClient.put(`${API}`, {
    examCategoryId,
    userId,
    title,
    description,
    grade,
    year,
    totalQuestionCount,
    versionCount,
    randomizeQuestions,
  });
};

const deleteExam = async examId => {
  return await axiosClient.delete(`${API}`, {
    data: { id: examId },
  });
};

const getExamDetail = examId => {
  return axiosClient.get(`/api/exams/${examId}/detail`);
};

export {
  getExamCategory,
  getExamByCategoryById,
  getAllExams,
  getExamById,
  getExamCountByGrade,
  postExam,
  putExam,
  deleteExam,
  getExamDetail,
  generateAutoExam,
  postExamCategory,
  updateExamCategory,
  deleteExamCategory,
};
