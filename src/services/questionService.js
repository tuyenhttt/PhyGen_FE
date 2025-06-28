import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllQuestions = async () => {
  return await axiosClient.get(`${API}/examquestions`);
};

export { getAllQuestions };
