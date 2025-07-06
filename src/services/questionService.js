import axiosClient from '@/services/axiosClient';

const API = 'api';

const getAllQuestions = async params => {
  return await axiosClient.get(`${API}/questions`, { params });
};

const getQuestionsByTopicId = async topicId => {
  return await axiosClient.get(`${API}/questions/topic/${topicId}`, {
    params: { TopicId: topicId },
  });
};

const updateQuestion = async data => {
  return await axiosClient.put(`${API}/questions`, data);
};

const deleteQuestion = async id => {
  try {
    const res = await axiosClient.delete(`${API}/questions`, {
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
  updateQuestion,
  deleteQuestion,
};
