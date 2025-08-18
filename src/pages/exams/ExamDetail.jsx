import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax';
import { MdDownload } from 'react-icons/md';

import { getExamDetail } from '@/services/examService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';

const hasText = v => (v ?? '').toString().trim().length > 0;
const ALPHAS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Phân loại câu hỏi theo sectionType */
const getQuestionKind = (q, sectionType = '') => {
  const name = (q?.typeName ?? '').toString().trim();
  if (name) {
    return (
      {
        MultipleChoice: 'mcq',
        TrueFalse: 'tf',
        ShortAnswer: 'short',
        Essay: 'essay',
      }[name] ?? 'mcq'
    );
  }
  if (typeof q?.type === 'number') {
    return { 0: 'mcq', 1: 'tf', 2: 'short', 3: 'essay' }[q.type] ?? 'mcq';
  }
  const t = (sectionType ?? '').toLowerCase();
  if (t.includes('tự luận') || t.includes('tuluan') || t.includes('essay'))
    return 'essay';
  if (t.includes('ngắn') || t.includes('short')) return 'short';
  if (t.includes('đúng') || t.includes('sai') || t.includes('truefalse'))
    return 'tf';
  return 'mcq';
};

/** Nếu câu/đáp án dài thì hiển thị dọc */
const isLongLayout = (q, opts) => {
  const qLen = (q?.content ?? '').length;
  const maxOpt = Math.max(0, ...opts.map(o => (o.value ?? '').length));
  return qLen > 160 || maxOpt > 60 || opts.length > 4;
};

const InlineOption = ({ label, text }) => (
  <span className='inline-flex items-start gap-1'>
    <span className='font-semibold'>{label}.</span>
    <span className='text-gray-900'>{text}</span>
  </span>
);

const BlockOption = ({ label, text }) => (
  <div className='flex items-start gap-2'>
    <span className='font-semibold'>{label}.</span>
    <span className='text-gray-900'>{text}</span>
  </div>
);

const QuestionItemChoice = ({ q, index }) => {
  // Lấy tối đa 6 đáp án, chỉ giữ đáp án có nội dung
  const opts = ALPHAS.map((L, i) => ({
    label: L,
    value: q?.[`answer${i + 1}`],
  })).filter(o => hasText(o.value));

  const long = isLongLayout(q, opts);

  useMemo(() => {
    const raw = (q?.correctAnswer ?? '').toString().trim();
    if (!raw) return null;
    const up = raw.toUpperCase();
    if (ALPHAS.includes(up)) return up;
    if (/^[1-6]$/.test(raw)) return ALPHAS[+raw - 1];
    const exact = opts.find(o => (o.value ?? '').toString().trim() === raw);
    if (exact) return exact.label;
    if (/^(true|đúng|dung)$/i.test(raw)) {
      const tf = opts.find(o => /(true|đúng|dung)/i.test(o.value ?? ''));
      return tf?.label ?? null;
    }
    if (/^(false|sai)$/i.test(raw)) {
      const tf = opts.find(o => /(false|sai)/i.test(o.value ?? ''));
      return tf?.label ?? null;
    }
    return null;
  }, [q, opts]);

  const cols = Math.min(opts.length || 1, 4);

  return (
    <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
      <div className='rounded mb-4'>
        <p className='font-semibold'>
          Câu {index + 1}:
          <span className='font-normal'> {q?.content ?? ''}</span>
        </p>

        {opts.length > 0 &&
          (long ? (
            <div className='mt-2 space-y-1'>
              {opts.map(o => (
                <BlockOption key={o.label} label={o.label} text={o.value} />
              ))}
            </div>
          ) : (
            <div
              className='mt-2 grid gap-x-8 gap-y-2'
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {opts.map(o => (
                <InlineOption key={o.label} label={o.label} text={o.value} />
              ))}
            </div>
          ))}
      </div>
    </MathJaxContext>
  );
};

const QuestionItemShort = ({ q, index }) => (
  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
    <div className='rounded mb-4'>
      <p className='font-semibold'>
        Câu {index + 1}:<span className='font-normal'> {q?.content ?? ''}</span>
      </p>
      {hasText(q?.correctAnswer) || hasText(q?.answer1) ? (
        <p className='mt-2'>
          <span className='font-semibold'>Đáp án:</span>{' '}
          <span className='text-gray-900'>
            {(q?.correctAnswer ?? q?.answer1) || ''}
          </span>
        </p>
      ) : null}
    </div>
  </MathJaxContext>
);

const QuestionItemEssay = ({ q, index }) => (
  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
    <div className='rounded mb-4'>
      <p className='font-semibold'>
        Câu {index + 1}:<span className='font-normal'> {q?.content ?? ''}</span>
      </p>
      {typeof q?.score === 'number' && (
        <p className='mt-2 text-sm text-gray-600'>Điểm: {q.score}</p>
      )}
    </div>
  </MathJaxContext>
);

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  const subject = exam?.subject || 'Vật lí';
  const duration = typeof exam?.duration === 'number' ? exam.duration : 45;

  // Map sectionType sang tiếng Việt
  const mapSectionType = (sectionType) => {
    if (sectionType === 0 || sectionType === '0' || sectionType === 'MultipleChoice') return 'Trắc nghiệm nhiều lựa chọn';
    if (sectionType === 1 || sectionType === '1' || sectionType === 'TrueFalse') return 'Trắc nghiệm đúng sai';
    if (sectionType === 2 || sectionType === '2' || sectionType === 'ShortAnswer') return 'Trắc nghiệm trả lời ngắn';
    if (sectionType === 3 || sectionType === '3' || sectionType === 'Essay') return 'Tự luận';
    return sectionType ?? '';
  };

  return (
    <section className='max-w-3xl mx-auto py-20 min-h-[600px]'>
      <div className='mb-6 flex items-center justify-between'>
        <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>
        <CommonButton className='inline-flex items-center text-[16px] gap-2 rounded-xl py-2 bg-gradient-to-r from-green-600 to-green-600 text-white shadow-sm hover:shadow-md hover:opacity-95 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-300'>
          <MdDownload size={18} />
          Tải xuống đề thi
        </CommonButton>
      </div>

      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-start justify-between'>
          <div className='text-center'>
            <div className='uppercase font-semibold text-gray-900'>
              BỘ GIÁO DỤC VÀ ĐÀO TẠO
            </div>
            {exam?.description && (
              <p className='text-gray-900 font-semibold mb-4 uppercase'>
                {exam.description}
              </p>
            )}
            <div className='text-sm italic text-gray-700'>Đề minh họa</div>
          </div>

          <div className='text-center'>
            <div className='uppercase font-bold text-gray-900'>
              {exam?.title && (
                <p className='text-gray-800 mb-4'>{exam.title}</p>
              )}
            </div>
            <div className='font-semibold text-gray-900 space-x-4'>
              <span>Môn: {subject}</span>
              <span>Năm: {exam?.year}</span>
            </div>
            <div className='italic text-gray-800'>
              Thời gian làm bài: {duration} phút, không kể thời gian phát đề
            </div>
          </div>
        </div>

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
        {exam?.examCode && <span>Mã đề: {exam.examCode}</span>}
      </div>

      {hasError && (
        <p className='text-red-600 mb-4'>
          Có lỗi khi tải đề thi. Vui lòng thử lại sau.
        </p>
      )}

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
          {Object.entries(
            exam.sections.reduce((acc, section) => {
              const typeLabel = mapSectionType(section?.sectionType);
              if (!acc[typeLabel]) acc[typeLabel] = [];
              acc[typeLabel].push(section);
              return acc;
            }, {})
          ).map(([typeLabel, sections], idx) => (
            <div key={typeLabel} className='mb-8'>
              <div className='flex items-center gap-2'>
                <h2 className='text-2xl font-semibold mb-2'>
                  {idx + 1}. {typeLabel}
                </h2>
              </div>
              {/* Gộp tất cả câu hỏi của các section cùng loại */}
              {sections.map((section, sidx) => (
                <div key={section?.id ?? sidx}>
                  {section?.questions?.length > 0 ? (
                    section.questions.map((q, qi) => {
                      const kind = getQuestionKind(q, section?.sectionType);
                      if (kind === 'essay')
                        return (
                          <QuestionItemEssay key={q?.id ?? `${sidx}-${qi}`} q={q} index={qi} />
                        );
                      if (kind === 'short')
                        return (
                          <QuestionItemShort key={q?.id ?? `${sidx}-${qi}`} q={q} index={qi} />
                        );
                      return (
                        <QuestionItemChoice key={q?.id ?? `${sidx}-${qi}`} q={q} index={qi} />
                      );
                    })
                  ) : (
                    <p className='italic text-gray-500'>
                      Chưa có câu hỏi nào trong phần này.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </section>
  );
};

export default ExamDetail;
