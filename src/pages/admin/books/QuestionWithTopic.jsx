import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReusableTable from '@/components/table/ReusableTable';
import { IoArrowBack } from 'react-icons/io5';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';

const mockQuestions = [
  {
    id: 'q1',
    question: 'Lực nào tác dụng lên vật khi vật rơi tự do?',
    difficulty: 'Trung bình',
  },
  {
    id: 'q2',
    question: 'Định luật II Newton phát biểu như thế nào?',
    difficulty: 'Khó',
  },
  {
    id: 'q3',
    question: 'Cường độ dòng điện được đo bằng gì?',
    difficulty: 'Dễ',
  },
];

const QuestionWithTopic = () => {
  const { id: topicId } = useParams();
  const location = useLocation();
  const { topicName, orderNo } = location.state || {};

  const [questions, setQuestions] = useState(mockQuestions);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(questions.length / itemsPerPage);
  const currentData = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      header: 'STT',
      accessor: 'no',
      render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    { header: 'Câu hỏi', accessor: 'question' },
    { header: 'Độ khó', accessor: 'difficulty' },
  ];

  const handleView = row => {
    setSelectedQuestion(row);
    setIsModalOpen(true);
  };

  const handleEdit = row => {
    alert(`Sửa câu hỏi: ${row.question}`);
  };

  const handleDelete = row => {
    alert(`Xoá câu hỏi: ${row.question}`);
  };

  return (
    <div className='p-6 min-h-screen'>
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={() => window.history.back()}
          className='p-2 cursor-pointer'
          title='Quay lại'
        >
          <IoArrowBack size={24} className='text-gray-700' />
        </button>
        <h2 className='text-2xl font-bold text-gray-800'>
          {orderNo && topicName
            ? `Bài ${orderNo}: ${topicName}`
            : 'Chi tiết bài học'}
        </h2>
      </div>

      <ReusableTable
        title='Danh sách câu hỏi có trong bài'
        columns={columns}
        data={currentData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          delete: 'delete',
        }}
      />
      {isModalOpen && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default QuestionWithTopic;
