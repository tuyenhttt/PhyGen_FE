import { useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BookCard from '@/components/cards/BookCard';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { PiExam } from 'react-icons/pi';
import { FaRegQuestionCircle } from 'react-icons/fa';

const SubjectBook = () => {
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
        Các sách Vật lý
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <BookCard
          key={1}
          title={1}
          onClick={() => handleCardClick()}
          icon={<FaClipboardList className='text-orange-500 w-6 h-6' />}
        />
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

export default SubjectBook;
