import axiosClient from '@/services/axiosClient';

const API = 'api/questions';

const getAllQuestions = async params => {
  return await axiosClient.get(`${API}`, { params });
};

const getQuestionsByTopicId = async (
  topicId,
  search,
  sort,
  pageIndex = 1,
  pageSize = 10
) => {
  return await axiosClient.get(
    `${API}/topic/${topicId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    {
      params: { TopicId: topicId, Search: search, Sort: sort },
    }
  );
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
  updateQuestion,
  deleteQuestion,
};
