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

const createChapter = async (subjectBookId, name, orderNo = 0) => {
  try {
    const res = await axiosClient.post(`${API}`, {
      subjectBookId,
      name,
      orderNo,
    });

    return res.data;
  } catch (err) {
    console.error('Lỗi khi tạo chương:', err.response?.data || err.message);
    throw err;
  }
};

const updateChapter = async ({ id, subjectBookId, name, orderNo }) => {
  try {
    const res = await axiosClient.put(`${API}`, {
      id,
      subjectBookId,
      name,
      orderNo,
    });
    return res.data;
  } catch (err) {
    console.error(
      'Lỗi khi cập nhật chương:',
      err.response?.data || err.message
    );
    throw err;
  }
};

const deleteChapter = async id => {
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
  getChapterBySubjectBooks,
  createChapter,
  updateChapter,
  deleteChapter,
};
