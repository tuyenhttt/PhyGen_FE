import axiosClient from '@/services/axiosClient';

const API = 'api/exams';

const getAllExams = async (params = {}) => {
  const usp = new URLSearchParams();

  if (params.pageIndex != null)
    usp.append('PageIndex', String(params.pageIndex));
  if (params.pageSize != null) usp.append('PageSize', String(params.pageSize));

  if (params.Status != null) usp.append('Status', String(params.Status));

  if (Array.isArray(params.Grade)) {
    params.Grade.forEach(g => usp.append('Grade', String(Number(g))));
  }
  if (Array.isArray(params.Year)) {
    params.Year.forEach(y => usp.append('Year', String(Number(y))));
  }

  if (Array.isArray(params.ExamCategory)) {
    params.ExamCategory.forEach(e => usp.append('ExamCategory', String(e)));
  }
  if (Array.isArray(params.ExamCategoryIds)) {
    params.ExamCategoryIds.forEach(id =>
      usp.append('ExamCategoryId', String(id))
    );
  }
  if (params.ExamCategoryId) {
    usp.append('ExamCategoryId', String(params.ExamCategoryId));
  }

  if (params.Title) usp.append('Title', params.Title);
  if (params.ExamCode) usp.append('ExamCode', params.ExamCode);
  if (params.Search) usp.append('Search', params.Search);
  if (params.Sort) usp.append('Sort', params.Sort);
  if (params.UserId) usp.append('UserId', String(params.UserId));

  return await axiosClient.get(`${API}?${usp.toString()}`);
};

const getExamCategory = async () => {
  return await axiosClient.get(`/api/examcategories`);
};

const getExamByCategoryById = async examCategoryId => {
  return await axiosClient.get(`/api/examcategories/${examCategoryId}`);
};

const getExamById = async examId => {
  return await axiosClient.get(`${API}/${examId}`);
};

const getExamCountByGrade = async grade => {
  return await axiosClient.get(`${API}`, {
    params: { Grade: [grade] },
  });
};

const postExam = async ({
  examCategoryId,
  userId,
  title,
  description,
  grade,
  year,
  totalQuestionCount,
  versionCount,
  randomizeQuestions,
  status,
  imgUrl
}) => {
  return await axiosClient.post(`${API}`, {
    examCategoryId,
    userId,
    title,
    description,
    grade,
    year,
    totalQuestionCount,
    versionCount,
    randomizeQuestions,
    status,
    imgUrl
  });
};

const generateAutoExam = async matrixData => {
  return await axiosClient.post(`${API}/generate`, matrixData, {
    timeout: 300000,
  });
};

const postExamCategory = body => axiosClient.post('/api/examcategories', body);

const updateExamCategory = payload =>
  axiosClient.put('/api/examcategories', payload);

const deleteExamCategory = id =>
  axiosClient.delete('/api/examcategories', { data: { id } });

const updateExam = body => axiosClient.put('/api/exams', body);

const updateExamsStatus = (ids, status) => {
  return axiosClient.patch('/api/exams/status', { ids, status });
};

const updateStatusExam = (id, status) => {
  return updateExamsStatus([id], status);
};

const deleteExam = async examId => {
  return await axiosClient.delete(`${API}`, {
    data: { id: examId },
  });
};

const getExamDetail = examId => {
  return axiosClient.get(`/api/exams/${examId}/detail`);
};
const exportExamFileWord = examId => {
  return axiosClient.get(`/api/exams/${examId}/export-word`, {
    timeout: 300000,
    responseType: 'arraybuffer',
    transformResponse: r => r,
  })
}

export {
  getExamCategory,
  getExamByCategoryById,
  getAllExams,
  getExamById,
  getExamCountByGrade,
  postExam,
  updateExam,
  deleteExam,
  getExamDetail,
  generateAutoExam,
  postExamCategory,
  updateExamCategory,
  deleteExamCategory,
  updateStatusExam,
  updateExamsStatus,
  exportExamFileWord
};
