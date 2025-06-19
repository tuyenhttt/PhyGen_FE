import axiosClient from '@/services/axiosClient';

const API = 'api';

const getExamCategory = async () => {
  return await axiosClient.get(`${API}/examcategories`);
};

const getAllExams = async () => {
  return await axiosClient.get(`${API}/exams`);
};

const getAllQuestions = async () => {
  return await axiosClient.get(`${API}/examquestions`);
};

export { getExamCategory, getAllExams, getAllQuestions };
