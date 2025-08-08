import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamDetail } from '@/services/examService';
import { IoArrowBack } from 'react-icons/io5';

const ExamDetailAdmin = () => {
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await getExamDetail(examId);
        setExam(res.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đề thi:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [examId]);

  if (isLoading) return <p className='text-center'>Đang tải...</p>;
  if (hasError)
    return (
      <p className='text-center text-red-600'>Lỗi khi tải chi tiết đề thi.</p>
    );
  if (!exam) return <p className='text-center'>Không tìm thấy đề thi.</p>;

  return (
    <section className='max-w-3xl mx-auto py-5'>
      {/* Header */}
      <div className='flex items-center justify-start gap-4 mb-6'>
        <button
          onClick={handleGoBack}
          className=' rounded cursor-pointer transition-colors duration-150'
          title='Quay lại'
        >
          <IoArrowBack size={24} className='text-gray-800' />
        </button>
        <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>
          {exam?.title ?? 'Đang tải tiêu đề...'}
        </h1>
      </div>
      <p className='text-gray-800 mb-4'>{exam.description}</p>
      <div className='flex gap-4 mb-6 text-sm text-gray-800'>
        <span>Lớp: {exam.grade}</span>
        <span>Năm: {exam.year}</span>
      </div>

      {/* Banner image */}
      {exam.imgUrl && (
        <img
          src={exam.imgUrl}
          alt={exam.title}
          className='w-full h-100 rounded mb-8'
        />
      )}

      {/* Sections */}
      {exam.sections.map((section, idx) => (
        <div key={section.id} className='mb-8'>
          <h2 className='text-2xl font-semibold mb-2'>
            {idx + 1}. {section.title}
          </h2>
          {section.description && (
            <p className='mb-4 text-gray-700'>{section.description}</p>
          )}

          {/* Questions */}
          {section.questions && section.questions.length > 0 ? (
            section.questions.map((q, qi) => (
              <div key={q.id || qi} className='p-4 border rounded mb-4'>
                <p>
                  <strong>Câu {qi + 1}:</strong> {q.question}
                </p>
              </div>
            ))
          ) : (
            <p className='italic text-gray-500'>
              Chưa có câu hỏi nào trong phần này.
            </p>
          )}
        </div>
      ))}
    </section>
  );
};

export default ExamDetailAdmin;
