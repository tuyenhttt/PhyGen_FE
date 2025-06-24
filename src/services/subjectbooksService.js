import axiosClient from '@/services/axiosClient';

const API = 'api/subjectbooks';

const getSubject = async () => {
  return await axiosClient.get('/api/subjects');
};

const getAllSubjectBooks = async subjectId => {
  return await axiosClient.get(`${API}/subject`, {
    params: { SubjectId: subjectId, Sort: 'grade' },
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

export {
  getSubject,
  getAllSubjectBooks,
  getSubjectBookById,
  getSubjectBookCountBySubject,
};
