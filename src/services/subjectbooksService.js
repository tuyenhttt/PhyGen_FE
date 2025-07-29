import axiosClient from '@/services/axiosClient';

const API = 'api/subjectbooks';

const getAllSubjectBooks = async (subjectId, PageIndex = 1, PageSize = 50) => {
  return await axiosClient.get(`${API}/subject`, {
    params: { SubjectId: subjectId, Sort: 'grade', PageIndex, PageSize },
  });
};

const getSubjectBookCountBySubject = async subjectId => {
  const res = await axiosClient.get('/api/subjectbooks/subject', {
    params: {
      SubjectId: subjectId,
      PageSize: 1,
      PageIndex: 1,
    },
  });

  return res.data?.data?.count || 0;
};

const getSubjectBookById = async id => {
  return await axiosClient.get(`${API}/${id}`);
};

const postSubjectBook = async payload => {
  return await axiosClient.post(`${API}`, payload);
};

const updateSubjectBook = async payload => {
  return await axiosClient.put(`${API}`, payload);
};

const deleteSubjectBook = async id => {
  try {
    const res = await axiosClient.delete(`${API}`, {
      data: { id },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi xóa sách:', err.response?.data || err.message);
    throw err;
  }
};

export {
  getAllSubjectBooks,
  getSubjectBookById,
  getSubjectBookCountBySubject,
  postSubjectBook,
  updateSubjectBook,
  deleteSubjectBook,
};
