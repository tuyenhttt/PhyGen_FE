import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllQuestions = async params => {
  return await axiosClient.get(`${API}/questions`, { params });
};

export { getAllQuestions };
