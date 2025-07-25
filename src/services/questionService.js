import axiosClient from '@/services/axiosClient';

const API = 'api/questions';

const getAllQuestions = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  level,
  type,
  sort,
} = {}) => {
  return await axiosClient.get(`${API}`, {
    params: {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Search: search,
      Level: level,
      Type: type,
      Sort: sort,
    },
  });
};

const getQuestionsByTopicId = ({
  topicId,
  search = '',
  level = null,
  type = null,
  pageIndex = 1,
  pageSize = 10,
  sort = '',
}) => {
  return axiosClient.get(`${API}/topic`, {
    params: {
      TopicId: topicId,
      Search: search,
      Level: level,
      Type: type,
      Sort: sort,
      PageIndex: pageIndex,
      PageSize: pageSize,
    },
  });
};

const postQuestion = async params => {
  return await axiosClient.post(`${API}`, params);
};

const updateQuestion = async data => {
  return await axiosClient.put(`${API}`, data);
};

const deleteQuestion = async id => {
  try {
    const res = await axiosClient.delete(`${API}`, {
      data: { id },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi xóa câu hỏi:', err.response?.data || err.message);
    throw err;
  }
};

export {
  getAllQuestions,
  getQuestionsByTopicId,
  postQuestion,
  updateQuestion,
  deleteQuestion,
};
