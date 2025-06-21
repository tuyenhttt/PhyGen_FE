import axiosClient from '@/services/axiosClient';

const API = 'api/chapters';

const getChapterBySubjectBooks = async (
  subjectbookid,
  pageIndex = 1,
  pageSize = 10
) => {
  return await axiosClient.get(`${API}/subjectbook`, {
    params: {
      SubjectBookId: subjectbookid,
      pageIndex,
      pageSize,
    },
  });
};

export { getChapterBySubjectBooks };
