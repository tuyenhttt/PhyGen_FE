import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamDetail } from '@/services/examService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { MdDownload } from 'react-icons/md';

const ExamDetailAdmin = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await getExamDetail(examId);
        setExam(res.data?.data ?? null);
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

  const subject = exam.subject || 'Vật lí';
  const duration = typeof exam.duration === 'number' ? exam.duration : 50;

  return (
    <section className='max-w-3xl mx-auto py-5'>
      {/* Nút quay lại + tải xuống */}
      <div className='mb-6 flex items-center justify-between'>
        <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>

        <CommonButton
          className='inline-flex items-center text-[16px] gap-2 rounded-xl py-2
               bg-gradient-to-r from-green-600 to-green-600 text-white
               shadow-sm hover:shadow-md hover:opacity-95 
               active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-300'
        >
          <MdDownload size={18} />
          Tải xuống đề thi
        </CommonButton>
      </div>

      {/* HEADER  */}
      <div className='mb-6'>
        <div className='flex items-start justify-between'>
          {/* Cột trái */}
          <div className='text-center'>
            <div className='uppercase font-semibold text-gray-900'>
              BỘ GIÁO DỤC VÀ ĐÀO TẠO
            </div>

            {exam.description && (
              <p className='text-gray-900 font-semibold mb-4 uppercase'>
                {exam.description}
              </p>
            )}
            <div className='text-sm italic text-gray-700'>Đề minh họa</div>
          </div>

          {/* Cột phải */}
          <div className='text-center'>
            <div className='uppercase font-bold text-gray-900'>
              {exam.title && <p className='text-gray-800 mb-4'>{exam.title}</p>}
            </div>
            <div className='font-semibold text-gray-900 space-x-4'>
              <span>Môn: {subject}</span>
              <span>Năm: {exam.year}</span>
            </div>
            <div className='italic text-gray-800'>
              Thời gian làm bài: {duration} phút, không kể thời gian phát đề
            </div>
          </div>
        </div>

        {/* Dòng kẻ tên thí sinh / SBD */}
        <div className='mt-6 space-y-2 text-gray-900'>
          <div>
            Họ, tên thí sinh:{' '}
            <span className='inline-block align-middle w-2/3 border-b border-dotted border-gray-800' />
          </div>
          <div>
            Số báo danh:{' '}
            <span className='inline-block align-middle w-2/3 border-b border-dotted border-gray-800' />
          </div>
        </div>
      </div>

      <div className='flex gap-4 mb-6 text-sm text-gray-800'>
        {exam.examCode && <span>Mã đề: {exam.examCode}</span>}
      </div>

      {/* Ảnh banner nếu có  */}
      {exam.imgUrl && (
        <img
          src={exam.imgUrl}
          alt={exam.title}
          className='w-full h-auto rounded mb-6'
        />
      )}

      {/* Phần / câu hỏi */}
      {Array.isArray(exam.sections) && exam.sections.length > 0 ? (
        exam.sections.map((section, idx) => (
          <div key={section.id || idx} className='mb-8'>
            <h2 className='text-2xl font-semibold mb-2'>
              {idx + 1}. {section.title}
            </h2>
            {section.description && (
              <p className='mb-4 text-gray-700'>{section.description}</p>
            )}
            {Array.isArray(section.questions) &&
            section.questions.length > 0 ? (
              section.questions.map((q, qi) => (
                <div key={q.id || qi} className='mb-4'>
                  <p>
                    <strong>Câu {qi + 1}:</strong> {q.content || q.question}
                  </p>
                  {[
                    q.answer1,
                    q.answer2,
                    q.answer3,
                    q.answer4,
                    q.answer5,
                    q.answer6,
                  ].filter(Boolean).length > 0 && (
                    <ul className='mt-1 ml-6 list-disc text-gray-700'>
                      {[
                        q.answer1,
                        q.answer2,
                        q.answer3,
                        q.answer4,
                        q.answer5,
                        q.answer6,
                      ]
                        .filter(Boolean)
                        .map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className='italic text-gray-500'>
                Chưa có câu hỏi nào trong phần này.
              </p>
            )}
          </div>
        ))
      ) : (
        <p className='italic text-gray-500'>Đề thi chưa có phần nào.</p>
      )}
    </section>
  );
};

export default ExamDetailAdmin;
