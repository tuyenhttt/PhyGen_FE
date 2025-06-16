import axiosClient from '@/services/axiosClient';

const API = 'api/examcategories';

const getExamCategory = async () => {
  return await axiosClient.get(`${API}`);
};

export { getExamCategory };
