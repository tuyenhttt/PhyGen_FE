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

export { getTopicByChapterId, getTopicById };
