import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamDetail } from '@/services/examService';
import { IoArrowBack } from 'react-icons/io5';
import { MathJaxContext } from 'better-react-mathjax';

const isEssaySection = sectionType => {
  const t = (sectionType ?? '').toString().toLowerCase().trim();
  return ['essay', 'tu_luan', 'tu luận', 'tuluan', 'tự luận'].some(k =>
    t.includes(k)
  );
};

const normalizeCorrectLabel = q => {
  const options = [
    { label: 'A', value: q?.answer1 ?? '' },
    { label: 'B', value: q?.answer2 ?? '' },
    { label: 'C', value: q?.answer3 ?? '' },
    { label: 'D', value: q?.answer4 ?? '' },
  ];

  const caRaw = (q?.correctAnswer ?? '').toString().trim();
  if (!caRaw) return null;

  if (['A', 'B', 'C', 'D'].includes(caRaw.toUpperCase()))
    return caRaw.toUpperCase();
  if (['1', '2', '3', '4'].includes(caRaw)) {
    return ['A', 'B', 'C', 'D'][parseInt(caRaw, 10) - 1];
  }
  const matched = options.find(
    o => (o.value ?? '').toString().trim() === caRaw
  );
  return matched?.label ?? null;
};

const AnswerRow = ({ label, text, isCorrect }) => (
  <div
    className={`flex items-start gap-2 rounded px-3 py-2
      ${isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}
    `}
  >
    <span className='font-semibold shrink-0'>{label}.</span>
    <span className='text-gray-800'>{text}</span>
    {isCorrect && (
      <span className='ml-2 text-green-700 font-medium'>(Đúng)</span>
    )}
  </div>
);

const QuestionItemChoice = ({ q, index }) => {
  const correctLabel = useMemo(() => normalizeCorrectLabel(q), [q]);
  const options = [
    { label: 'A', value: q?.answer1 ?? '' },
    { label: 'B', value: q?.answer2 ?? '' },
    { label: 'C', value: q?.answer3 ?? '' },
    { label: 'D', value: q?.answer4 ?? '' },
  ];

  return (
    <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
      <div className='p-4 rounded mb-4'>
        <p className='font-medium'>
          <strong>Câu {index + 1}:</strong> {q?.content ?? ''}
        </p>
        <div className='mt-3 space-y-2'>
          {options.map(opt => (
            <AnswerRow
              key={opt.label}
              label={opt.label}
              text={opt.value}
              isCorrect={correctLabel === opt.label}
            />
          ))}
        </div>
      </div>
    </MathJaxContext>
  );
};

const QuestionItemEssay = ({ q, index }) => {
  return (
    <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
      <div className='p-4 rounded mb-4'>
        <p className='font-medium'>
          <strong>Câu {index + 1}:</strong> {q?.content ?? ''}
        </p>

        {typeof q?.score === 'number' && (
          <p className='mt-2 text-sm text-gray-600'>Điểm: {q.score}</p>
        )}
      </div>
    </MathJaxContext>
  );
};

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        setExam(res?.data?.data ?? null);
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đề thi:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [examId]);

  return (
    <section className='max-w-3xl mx-auto py-20 min-h-[600px]'>
      {/* Header */}
      <div className='flex items-center justify-start gap-4 mb-6'>
        <button
          onClick={handleGoBack}
          className='p-2 rounded cursor-pointer transition-colors duration-150 hover:bg-gray-100'
          title='Quay lại'
        >
          <IoArrowBack size={24} className='text-gray-800' />
        </button>
        <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>
          {exam?.title ?? 'Đang tải tiêu đề...'}
        </h1>
      </div>

      {hasError && (
        <p className='text-red-600 mb-4'>
          Có lỗi khi tải đề thi. Vui lòng thử lại sau.
        </p>
      )}

      <p className='text-gray-800 mb-4'>
        {exam?.description ?? 'Đang tải mô tả đề thi...'}
      </p>

      {exam && (
        <div className='flex flex-wrap gap-4 mb-6 text-sm text-gray-800'>
          <span>Lớp: {exam?.grade}</span>
          <span>Năm: {exam?.year}</span>
        </div>
      )}

      {/* Banner image */}
      {exam?.imgUrl && (
        <img
          src={exam.imgUrl}
          alt={exam?.title ?? 'Exam banner'}
          className='w-full h-auto rounded mb-8 object-cover'
        />
      )}

      {isLoading && (
        <p className='text-center text-gray-600 mt-10'>
          Đang tải dữ liệu đề thi...
        </p>
      )}

      {!isLoading && !exam && !hasError && (
        <p className='text-center text-red-500 mt-10'>
          Không tìm thấy thông tin đề thi.
        </p>
      )}

      {/* Nội dung chính */}

      {!isLoading && exam?.sections?.length > 0 && (
        <>
          {exam.sections.map((section, idx) => {
            const essay = isEssaySection(section?.sectionType);

            return (
              <div key={section?.id ?? idx} className='mb-8'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-2xl font-semibold mb-2'>
                    {idx + 1}. {section?.title}
                  </h2>
                  {section?.sectionType && (
                    <span className='mb-2 text-xs px-2 py-1 bg-gray-100 text-gray-700'>
                      {section.sectionType}
                    </span>
                  )}
                </div>

                {section?.description && (
                  <p className='mb-4 text-gray-700'>{section.description}</p>
                )}

                {section?.questions?.length > 0 ? (
                  section.questions.map((q, qi) =>
                    essay ? (
                      <QuestionItemEssay key={q?.id ?? qi} q={q} index={qi} />
                    ) : (
                      <QuestionItemChoice key={q?.id ?? qi} q={q} index={qi} />
                    )
                  )
                ) : (
                  <p className='italic text-gray-500'>
                    Chưa có câu hỏi nào trong phần này.
                  </p>
                )}
              </div>
            );
          })}
        </>
      )}
    </section>
  );
};

export default ExamDetail;
