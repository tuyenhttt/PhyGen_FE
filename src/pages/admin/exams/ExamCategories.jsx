import { useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BookCard from '@/components/cards/BookCard';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { PiExam } from 'react-icons/pi';
import { FaRegQuestionCircle } from 'react-icons/fa';

// Dữ liệu mẫu cho các kỳ thi
const examsData = [
  {
    id: 'gk1-10',
    type: 'Giữa kỳ 1',
    grade: 10,
    detail: { questions: 120, papers: 10, matrix: 2 },
  },
  {
    id: 'ck1-10',
    type: 'Cuối kỳ 1',
    grade: 10,
    detail: { questions: 150, papers: 12, matrix: 3 },
  },
  {
    id: 'gk2-10',
    type: 'Giữa kỳ 2',
    grade: 10,
    detail: { questions: 100, papers: 8, matrix: 2 },
  },
  {
    id: 'ck2-10',
    type: 'Cuối kỳ 2',
    grade: 10,
    detail: { questions: 180, papers: 15, matrix: 4 },
  },
  {
    id: 'gk1-11',
    type: 'Giữa kỳ 1',
    grade: 11,
    detail: { questions: 130, papers: 11, matrix: 2 },
  },
  {
    id: 'ck1-11',
    type: 'Cuối kỳ 1',
    grade: 11,
    detail: { questions: 160, papers: 13, matrix: 3 },
  },
  {
    id: 'gk2-11',
    type: 'Giữa kỳ 2',
    grade: 11,
    detail: { questions: 110, papers: 9, matrix: 2 },
  },
  {
    id: 'ck2-11',
    type: 'Cuối kỳ 2',
    grade: 11,
    detail: { questions: 190, papers: 16, matrix: 4 },
  },
  {
    id: 'gk1-12',
    type: 'Giữa kỳ 1',
    grade: 12,
    detail: { questions: 140, papers: 12, matrix: 3 },
  },
  {
    id: 'ck1-12',
    type: 'Cuối kỳ 1',
    grade: 12,
    detail: { questions: 170, papers: 14, matrix: 4 },
  },
  {
    id: 'gk2-12',
    type: 'Giữa kỳ 2',
    grade: 12,
    detail: { questions: 120, papers: 10, matrix: 3 },
  },
  {
    id: 'ck2-12',
    type: 'Cuối kỳ 2',
    grade: 12,
    detail: { questions: 200, papers: 18, matrix: 5 },
  },
];

const ExamCategories = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const handleCardClick = exam => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExam(null);
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Danh sách kỳ thi
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {examsData.map(exam => (
          <BookCard
            key={exam.id}
            title={`${exam.type} lớp ${exam.grade}`}
            onClick={() => handleCardClick(exam)}
            icon={<FaClipboardList className='text-orange-500 w-6 h-6' />}
          />
        ))}
      </div>

      {/* Pop-up (Modal) */}
      <ConfirmModal
        visible={showModal}
        onClose={closeModal}
        // Sử dụng type và grade riêng biệt cho tiêu đề modal
        title={
          selectedExam
            ? `Thông tin Kỳ thi ${selectedExam.type} lớp ${selectedExam.grade}`
            : ''
        }
      >
        {selectedExam && (
          <div className='space-y-3 text-lg text-gray-700'>
            <p className='flex items-center gap-2 text-gray-700 text-base'>
              <AiOutlineAppstoreAdd className='text-orange-500 w-7 h-7' />
              <span className='font-semibold text-gray-800'>
                Số lượng ma trận:
              </span>
              <span>{selectedExam.detail.matrix}</span>
            </p>
            <p className='flex items-center gap-2 text-gray-700 text-base'>
              <PiExam className='text-orange-500 w-7 h-7' />
              <span className='font-semibold text-gray-800'>
                Số lượng đề thi:
              </span>
              <span>{selectedExam.detail.papers}</span>
            </p>
            <p className='flex items-center gap-2 text-gray-700 text-base'>
              <FaRegQuestionCircle className='text-orange-500 w-7 h-7' />
              <span className='font-semibold text-gray-800'>
                Số lượng câu hỏi:
              </span>
              <span>{selectedExam.detail.questions}</span>
            </p>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default ExamCategories;
