import { useEffect, useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BookCard from '@/components/cards/BookCard';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { PiExam } from 'react-icons/pi';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { getAllExams } from '@/services/examService';
import useExamCategories from '@/hooks/useExamCategories';

const ExamCategories = () => {
  const { examOptions } = useExamCategories();

  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const params = {
        pageIndex,
        pageSize,
        grade: selectedGrades,
        examCategoryId: selectedExams,
        year: selectedYears,
      };

      const response = await getAllExams(params);
      const data = response.data?.data;

      setExams(data?.data || []);
      setTotalCount(data?.count || 0);
    } catch (err) {
      console.error('Lỗi khi gọi API lấy danh sách đề thi:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedGrades, selectedExams, selectedYears, pageIndex]);

  const handleCardClick = async examCategory => {
    const examData = exams.find(ex => ex.examCategoryId === examCategory.value);

    if (examData) {
      setSelectedExam({
        ...examData,
        name: examCategory.label,
      });
      setShowModal(true);
    } else {
      console.warn('Không tìm thấy dữ liệu kỳ thi với category:', examCategory);
    }
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
        {examOptions.map(exam => (
          <BookCard
            key={exam.value}
            title={exam.label}
            onClick={() => handleCardClick(exam)}
            icon={<FaClipboardList className='text-orange-500 w-6 h-6' />}
          />
        ))}
      </div>

      {/* Modal thông tin kỳ thi */}
      <ConfirmModal
        visible={showModal}
        onClose={closeModal}
        title={
          selectedExam
            ? `Thông tin Kỳ thi ${selectedExam.name} lớp ${selectedExam.grade}`
            : ''
        }
      >
        {selectedExam && (
          <div className='space-y-3 text-lg text-gray-700'>
            <p className='flex items-center gap-2 text-base'>
              <AiOutlineAppstoreAdd className='text-orange-500 w-6 h-6' />
              <span className='font-semibold text-gray-800'>
                Số lượng ma trận:
              </span>
              <span>{selectedExam.detail?.matrix || 0}</span>
            </p>
            <p className='flex items-center gap-2 text-base'>
              <PiExam className='text-orange-500 w-6 h-6' />
              <span className='font-semibold text-gray-800'>
                Số lượng đề thi:
              </span>
              <span>{selectedExam.detail?.papers || 0}</span>
            </p>
            <p className='flex items-center gap-2 text-base'>
              <FaRegQuestionCircle className='text-orange-500 w-6 h-6' />
              <span className='font-semibold text-gray-800'>
                Số lượng câu hỏi:
              </span>
              <span>{selectedExam.detail?.questions || 0}</span>
            </p>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default ExamCategories;
