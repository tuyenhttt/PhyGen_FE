import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { getAllQuestions } from '@/services/questionService';
import ReusableTable from '@/components/table/ReusableTable';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import { toast } from 'react-toastify';

const handleSectionType = sectionType => {
  switch (sectionType) {
    case 'Trắc nghiệm nhiều đáp án':
      return 'MultipleChoice';
    case 'Trắc nghiệm Đúng/Sai':
      return 'TrueFalse';
    case 'Câu hỏi trả lời ngắn':
      return 'ShortAnswer';
    case 'Tự luận':
      return 'Essay';
    default:
      return sectionType;
  }
};

const QuestionSelectionModal = ({
  sectionId,
  sectionType,
  levelName,
  quantityLimit,
  initialSelectedQuestions,
  onClose,
  onSave,
}) => {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    level: levelName || '',
    type: sectionType || '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState(
    initialSelectedQuestions
  );
  const [selectedQuestionForDetail, setSelectedQuestionForDetail] =
    useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 10;

  //Hàm fetch câu hỏi với bộ lọc ban đầu từ section
  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions({
        search: searchTerm,
        level: filter.level,
        type: handleSectionType(filter.type),
        pageIndex: currentPage,
        pageSize: itemsPerPage,
      });

      const result = res.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const formatted = data.map((q, index) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + index + 1,
        isSelected: selectedQuestions.some(sq => sq.id === q.id),
      }));

      setQuestions(formatted);
      setTotalPages(Math.ceil(result?.count / itemsPerPage));
    } catch (err) {
      console.error('Lỗi khi fetch câu hỏi:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm, filter, currentPage]);

  useEffect(() => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => ({
        ...q,
        isSelected: selectedQuestions.some(sq => sq.id === q.id),
      }))
    );
  }, [selectedQuestions]);

  const columns = [
    {
      header: 'Chọn',
      accessor: 'select',
      render: (value, row) => (
        <input
          type='checkbox'
          checked={selectedQuestions.some(sq => sq.id === row.id)}
          onChange={() => handleSelectQuestion(row)}
          disabled={
            selectedQuestions.length >= quantityLimit &&
            !selectedQuestions.some(sq => sq.id === row.id)
          }
          className='form-checkbox h-4 w-4 text-blue-600'
        />
      ),
    },
    { header: 'STT', accessor: 'no' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <div className='max-w-[250px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: value => {
        const levelMap = {
          NhậnBiết: 'Nhận biết',
          ThôngHiểu: 'Thông hiểu',
          VậnDụng: 'Vận dụng',
        };
        return levelMap[value] || value || '—';
      },
    },
    {
      header: 'Loại',
      accessor: 'typeName',
      render: value => {
        const typeMap = {
          MultipleChoice: 'Trắc nghiệm nhiều đáp án',
          TrueFalse: 'Trắc nghiệm Đúng/Sai',
          ShortAnswer: 'Câu hỏi trả lời ngắn',
          Essay: 'Tự luận',
        };
        return typeMap[value] || value || '—';
      },
    },
  ];

  const handleSelectQuestion = question => {
    setSelectedQuestions(prevSelected => {
      const isAlreadySelected = prevSelected.some(sq => sq.id === question.id);
      if (isAlreadySelected) {
        return prevSelected.filter(sq => sq.id !== question.id);
      } else {
        if (prevSelected.length < quantityLimit) {
          return [...prevSelected, question];
        } else {
          toast.warn(
            `Bạn chỉ có thể chọn tối đa ${quantityLimit} câu hỏi cho phần này.`
          );
          return prevSelected;
        }
      }
    });
  };

  const handleViewQuestion = question => {
    setSelectedQuestionForDetail(question);
    setIsDetailModalOpen(true);
  };

  const handleSaveQuestions = () => {
    onSave(sectionId, selectedQuestions);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto relative'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
        >
          <IoClose size={24} />
        </button>
        <h2 className='text-2xl font-bold mb-4 text-indigo-700'>
          Chọn câu hỏi cho phần "{levelName} - {sectionType}"
        </h2>
        <p className='text-gray-600 mb-4'>
          Bạn cần chọn {quantityLimit} câu hỏi.
        </p>
        <p className='text-gray-600 mb-4'>
          Đã chọn: {selectedQuestions.length} / {quantityLimit} câu hỏi.
        </p>

        <div className='flex gap-2 items-center relative mb-4'>
          <SearchInput
            placeholder='Tìm nội dung câu hỏi...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <ReusableTable
          columns={columns}
          data={questions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => setCurrentPage(page)}
          actions={{ view: handleViewQuestion }}
          actionIcons={{ view: 'view' }}
        />

        <div className='flex justify-end gap-3 mt-4'>
          <PrimaryButton
            onClick={onClose}
            className='bg-gray-500 hover:bg-gray-600'
          >
            Hủy
          </PrimaryButton>
          <PrimaryButton
            onClick={handleSaveQuestions}
            className='bg-green-500 hover:bg-green-600'
            disabled={selectedQuestions.length !== quantityLimit}
          >
            Lưu và đóng
          </PrimaryButton>
        </div>

        {isDetailModalOpen && selectedQuestionForDetail && (
          <QuestionDetailModal
            question={selectedQuestionForDetail}
            editMode={false}
            onClose={() => setIsDetailModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionSelectionModal;
