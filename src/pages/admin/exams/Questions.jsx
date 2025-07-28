import { useEffect, useState } from 'react';
import ReusableTable from '@/components/table/ReusableTable';
import {
  deleteQuestion,
  getAllQuestions,
  postQuestion,
  postQuestionMedia,
} from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa';
import { MdOutlineClear } from 'react-icons/md';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import AddQuestionModel from '@/components/ui/AddQuestionModel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import { getTopic } from '@/services/topicService';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    level: '',
    type: '',
    fromDate: '',
    toDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });

  const itemsPerPage = 10;
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toISOString() : null;

  const levelMap = {
    NhậnBiết: 0,
    ThôngHiểu: 1,
    VậnDụng: 2,
  };

  const typeMap = {
    MultipleChoice: 0,
    TrueFalse: 1,
    ShortAnswer: 2,
    Essay: 3,
  };

  const isValidGuid = guid =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      guid
    );

  const fetchData = async () => {
    try {
      const [questionsRes, topicsRes] = await Promise.all([
        getAllQuestions({
          pageIndex: currentPage,
          pageSize: itemsPerPage,
          search: searchTerm,
          level: filter.level,
          type: filter.type,
          fromDate: formatDate(filter.fromDate),
          toDate: formatDate(filter.toDate),
        }),
        getTopic(),
      ]);

      const topicsData = Array.isArray(topicsRes.data)
        ? topicsRes.data
        : Array.isArray(topicsRes.data.data)
        ? topicsRes.data.data
        : [];
      setTopics(topicsData);

      const result = questionsRes.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];
      const formatted = data.map((q, i) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + i + 1,
      }));
      setQuestions(formatted);
      setTotalPages(Math.ceil(result?.count / itemsPerPage));
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setQuestions([]);
      setTopics([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, filter]);

  const handleAddClick = () => setIsAddModalOpen(true);

  const handleView = row => {
    setSelectedQuestion(row);
    setEditMode(false);
    setIsViewModalOpen(true);
  };
  const handleEdit = row => {
    setSelectedQuestion(row);
    setEditMode(true);
    setIsViewModalOpen(true);
  };
  const handleDelete = question => setDeleteModal({ open: true, question });

  const confirmDeleteQuestion = async () => {
    try {
      await deleteQuestion(deleteModal.question.id);
      toast.success('Xoá câu hỏi thành công');
      setDeleteModal({ open: false, question: null });
      setCurrentPage(1);
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      toast.error('Lỗi khi xoá câu hỏi');
    }
  };

  const handleAddSave = async payload => {
    if (!isValidGuid(payload.topicId)) {
      toast.error('Chủ đề không hợp lệ. Vui lòng chọn lại.');
      return;
    }

    const questionBody = {
      topicId: payload.topicId,
      content: payload.content,
      level: levelMap[payload.levelName],
      type: typeMap[payload.typeName],
      image: payload.image,
      answer1: payload.answer1 || null,
      answer2: payload.answer2 || null,
      answer3: payload.answer3 || null,
      answer4: payload.answer4 || null,
      answer5: payload.answer5 || null,
      answer6: payload.answer6 || null,
      correctAnswer: payload.correctAnswer || null,
    };

    try {
      const response = await postQuestion(questionBody);
      const createdQuestion = response?.data?.data;

      if (!createdQuestion?.id) {
        throw new Error('Không có ID câu hỏi trả về!');
      }

      // Gửi hình ảnh kèm theo (nếu có)
      const imageUrls = (payload.image || '')
        .split(/[;,]/)
        .map(url => url.trim())
        .filter(Boolean);

      if (imageUrls.length > 0) {
        for (const url of imageUrls) {
          await postQuestionMedia({
            questionId: createdQuestion.id,
            mediaType: 'Image',
            url,
          });
        }
      }

      toast.success('Thêm câu hỏi thành công');
      setIsAddModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      toast.error('Lỗi thêm câu hỏi!');
    }
  };

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: v => (
        <div className='truncate max-w-[300px]' title={v}>
          {v}
        </div>
      ),
    },
    {
      header: 'Chủ đề',
      accessor: 'topicId',
      render: id => (
        <div
          className='truncate max-w-[150px]'
          title={topics.find(t => t.id === id)?.name || '—'}
        >
          {topics.find(t => t.id === id)?.name || '—'}
        </div>
      ),
    },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: v =>
        ({
          NhậnBiết: 'Nhận biết',
          ThôngHiểu: 'Thông hiểu',
          VậnDụng: 'Vận dụng',
        }[v] || '—'),
    },
    {
      header: 'Loại',
      accessor: 'typeName',
      render: v =>
        ({
          MultipleChoice: 'Trắc nghiệm nhiều đáp án',
          TrueFalse: 'Trắc nghiệm Đúng/Sai',
          ShortAnswer: 'Câu hỏi trả lời ngắn',
          Essay: 'Tự luận',
        }[v] || '—'),
    },
  ];

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh sách câu hỏi</h2>
        <button
          onClick={handleAddClick}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2'
        >
          <FaPlus /> Thêm câu hỏi
        </button>
      </div>

      <ReusableTable
        title='Danh sách câu hỏi'
        columns={columns}
        data={questions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        actions={{ view: handleView, edit: handleEdit, delete: handleDelete }}
        actionIcons={{ view: 'view', edit: 'edit', delete: 'delete' }}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm nội dung câu hỏi...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className='border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
            >
              <IoFilter />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterModal && (
              <div className='absolute top-full right-0 mt-2 z-50 w-64 bg-white border shadow-md rounded-md p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <MdOutlineClear />
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
                  <div>
                    <label className='font-medium'>Mức độ</label>
                    <select
                      value={filter.level}
                      onChange={e =>
                        setFilter({ ...filter, level: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='NhậnBiết'>Nhận biết</option>
                      <option value='ThôngHiểu'>Thông hiểu</option>
                      <option value='VậnDụng'>Vận dụng</option>
                    </select>
                  </div>

                  <div>
                    <label className='font-medium'>Loại câu hỏi</label>
                    <select
                      value={filter.type}
                      onChange={e =>
                        setFilter({ ...filter, type: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='MultipleChoice'>
                        Trắc nghiệm nhiều đáp án
                      </option>
                      <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
                      <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
                      <option value='Essay'>Tự luận</option>
                    </select>
                  </div>

                  {/* Ngày tạo */}
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='font-medium'>Từ ngày</label>
                      <input
                        type='date'
                        value={filter.fromDate}
                        onChange={e =>
                          setFilter({ ...filter, fromDate: e.target.value })
                        }
                        className='w-full border rounded-md px-2 py-1'
                      />
                    </div>
                    <div>
                      <label className='font-medium'>Đến ngày</label>
                      <input
                        type='date'
                        value={filter.toDate}
                        onChange={e =>
                          setFilter({ ...filter, toDate: e.target.value })
                        }
                        className='w-full border rounded-md px-2 py-1'
                      />
                    </div>
                  </div>
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setFilter({ level: '', type: '' });
                      setShowFilterModal(false);
                    }}
                    className='text-sm px-3 py-1.5 border rounded'
                  >
                    Bỏ lọc
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className='text-sm px-3 py-1.5 bg-blue-600 text-white rounded'
                  >
                    Lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />

      {isViewModalOpen && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          editMode={editMode}
          onSave={async payload => {
            await postQuestion(payload);
            setIsViewModalOpen(false);
            setCurrentPage(1);
          }}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isAddModalOpen && (
        <AddQuestionModel
          editMode={true}
          onSave={handleAddSave}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá câu hỏi'
        onClose={() => setDeleteModal({ open: false, exam: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá câu hỏi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, exam: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteQuestion}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Questions;
