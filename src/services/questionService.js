import axiosClient from '@/services/axiosClient';

const API = 'api/questions';

const getAllQuestions = async ({
  pageIndex = 1,
  pageSize = 10,
  search,
  level,
  type,
  sort,
  grade,
} = {}) => {
  return await axiosClient.get(`${API}`, {
    params: {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Search: search,
      Level: level,
      Type: type,
      Sort: sort,
      Grade: grade,
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

const postQuestionMedia = async params => {
  return await axiosClient.post('/api/questionmedias', {
    questionId: params.questionId,
    mediaType: params.mediaType,
    url: params.url,
  });
};

const getQuestionMediaById = async questionId => {
  return await axiosClient.get('/api/questionmedias/question', {
    params: { questionId },
  });
};

const deleteQuestionMedia = mediaId =>
  axiosClient.delete('/api/questionmedias', {
    data: { id: mediaId },
  });

export {
  getAllQuestions,
  getQuestionsByTopicId,
  postQuestion,
  updateQuestion,
  deleteQuestion,
  postQuestionMedia,
  getQuestionMediaById,
  deleteQuestionMedia,
};
