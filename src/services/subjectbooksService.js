import axiosClient from '@/services/axiosClient';

const API = 'api/subjectbooks';

const getSubject = async () => {
  return await axiosClient.get('/api/subjects');
};

const getAllSubjectBooks = async subjectId => {
  return await axiosClient.get(`${API}/subject`, {
    params: { SubjectId: subjectId },
  });
};

export { getSubject, getAllSubjectBooks };
