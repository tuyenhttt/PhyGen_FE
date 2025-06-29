import axiosClient from '@/services/axiosClient';

const API = 'api';

const getExamCategory = async () => {
  return await axiosClient.get(`${API}/examcategories`);
};

const getAllExams = async params => {
  return await axiosClient.get('/api/exams', { params });
};

export { getExamCategory, getAllExams };
