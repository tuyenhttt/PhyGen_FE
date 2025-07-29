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

const getExamById = async examId => {
  return await axiosClient.get(`${API}/${examId}`);
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
  getAllExams,
  getExamById,
  postExam,
  putExam,
  deleteExam,
  getExamDetail,
};
