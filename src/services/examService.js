import axiosClient from '@/services/axiosClient';

const API = 'api/exams';

const getExamCategory = async () => {
  return await axiosClient.get(`/api/examcategories`);
};

const getExamById = async examId => {
  return await axiosClient.get(`${API}/${examId}`);
};

const getAllExams = async params => {
  return await axiosClient.get(`${API}/exams`, { params });
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
    data: { id: examId }
  });
};


export { getExamCategory, getAllExams, getExamById, postExam, putExam, deleteExam };

