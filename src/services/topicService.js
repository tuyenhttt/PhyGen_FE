import axiosClient from '@/services/axiosClient';

const API = 'api/topics';

const getTopicByChapterId = async (chapterid, pageIndex = 1, pageSize = 10) => {
  return await axiosClient.get(`${API}/chapter`, {
    params: {
      ChapterId: chapterid,
      pageIndex,
      pageSize,
    },
  });
};

const getTopicById = topicId => {
  return axiosClient.get(`${API}/${topicId}`);
};

const createTopic = async (chapterId, name, orderNo = 0) => {
  try {
    const res = await axiosClient.post(`${API}`, {
      chapterId,
      name,
      orderNo,
    });

    return res.data;
  } catch (err) {
    console.error('Lỗi khi tạo bài học:', err.response?.data || err.message);
    throw err;
  }
};

const updateTopic = async ({ id, chapterId, name, orderNo }) => {
  try {
    const res = await axiosClient.put(`${API}`, {
      id,
      chapterId,
      name,
      orderNo,
    });
    return res.data;
  } catch (err) {
    console.error(
      'Lỗi khi cập nhật bài học:',
      err.response?.data || err.message
    );
    throw err;
  }
};

const deleteTopic = async id => {
  try {
    const res = await axiosClient.delete(`${API}`, {
      data: { id },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi xóa chương:', err.response?.data || err.message);
    throw err;
  }
};

export {
  getTopicByChapterId,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
