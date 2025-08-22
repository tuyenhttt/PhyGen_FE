import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { MdDownload } from 'react-icons/md';

import { getExamDetail } from '@/services/examService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';

import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  WidthType, AlignmentType, VerticalAlign, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';


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
    <span className='font-bold'>{label}.</span>
    <span className='text-gray-900'>{text}</span>
  </span>
);

const BlockOption = ({ label, text }) => (
  <div className='flex items-start gap-2'>
    <span className='font-bold'>{label}.</span>
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
      <MathJax dynamic>
        <div className='rounded mb-4'>
          <p className='font-bold'>
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
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {opts.map(o => (
                  <InlineOption key={o.label} label={o.label} text={o.value} />
                ))}
              </div>
            ))}
        </div>
      </MathJax>
    </MathJaxContext>
  );
};

const QuestionItemShort = ({ q, index }) => (
  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
    <MathJax dynamic>
      <div className='rounded mb-4'>
        <p className='font-bold'>
          Câu {index + 1}:
          <span className='font-normal'> {q?.content ?? ''}</span>
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
    </MathJax>
  </MathJaxContext>
);

const QuestionItemEssay = ({ q, index }) => (
  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
    <MathJax dynamic>
      <div className='rounded mb-4'>
        <p className='font-bold'>
          Câu {index + 1}:
          <span className='font-normal'> {q?.content ?? ''}</span>
        </p>
        {typeof q?.score === 'number' && (
          <p className='mt-2 text-sm text-gray-600'>Điểm: {q.score}</p>
        )}
      </div>
    </MathJax>
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
  const mapSectionType = sectionType => {
    if (
      sectionType === 0 ||
      sectionType === '0' ||
      sectionType === 'MultipleChoice'
    )
      return 'Trắc nghiệm nhiều lựa chọn';
    if (sectionType === 1 || sectionType === '1' || sectionType === 'TrueFalse')
      return 'Trắc nghiệm đúng sai';
    if (
      sectionType === 2 ||
      sectionType === '2' ||
      sectionType === 'ShortAnswer'
    )
      return 'Trắc nghiệm trả lời ngắn';
    if (sectionType === 3 || sectionType === '3' || sectionType === 'Essay')
      return 'Tự luận';
    return sectionType ?? '';
  };

  const downloadExamFile = async (exam, { subject = 'Vật lí', duration = 45 } = {}) => {
    if (!exam) return;

    const chunkSize = 10;
    const FIRST_COL_PCT = 8;
    const borderAll = {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
    };
    const hasText = v => (v ?? '').toString().trim().length > 0;

    const addAnswerTables = (children, totalCount, title) => {
      if (totalCount <= 0) return;

      children.push(
        new Paragraph({
          children: [new TextRun({ text: title, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 },
        })
      );

      for (let start = 1; start <= totalCount; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, totalCount);
        const cols = end - start + 1;
        const NUM_COL_PCT = (100 - FIRST_COL_PCT) / cols;

        const headerCells = [
          new TableCell({
            width: { size: FIRST_COL_PCT, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Câu', bold: true, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];
        for (let i = start; i <= end; i++) {
          headerCells.push(
            new TableCell({
              width: { size: NUM_COL_PCT, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        }

        const answerCells = [
          new TableCell({
            width: { size: FIRST_COL_PCT, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: 'Đáp án', bold: true, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];
        for (let i = start; i <= end; i++) {
          answerCells.push(
            new TableCell({
              width: { size: NUM_COL_PCT, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        }

        children.push(
          new Table({
            rows: [new TableRow({ children: headerCells }), new TableRow({ children: answerCells })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: borderAll,
          })
        );
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      }
    };

    const sections = Array.isArray(exam.sections) ? [...exam.sections] : [];
    sections.sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0));

    const mcQuestions = sections
      .filter(s => s?.sectionType === 'MultipleChoice')
      .flatMap(s => s?.questions ?? []);
    const tfQuestions = sections
      .filter(s => s?.sectionType === 'TrueFalse')
      .flatMap(s => s?.questions ?? []);
    const saQuestions = sections
      .filter(s => s?.sectionType === 'ShortAnswer')
      .flatMap(s => s?.questions ?? []);
    const essayQuestions = sections
      .filter(s => s?.sectionType === 'Essay')
      .flatMap(s => s?.questions ?? []);

    const children = [];

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: borderAll,
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO', bold: true })], alignment: AlignmentType.CENTER }),
                  new Paragraph({ children: [new TextRun({ text: 'TRƯỜNG THPT', bold: true })], alignment: AlignmentType.CENTER }),
                  new Paragraph({ children: [new TextRun({ text: '🙢★🙠' })], alignment: AlignmentType.CENTER }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: borderAll,
                children: [
                  new Paragraph({ children: [new TextRun({ text: (exam?.title || 'ĐỀ THI').toUpperCase(), bold: true, size: 28 })], alignment: AlignmentType.CENTER }),
                  new Paragraph({ children: [new TextRun({ text: `MÔN: ${subject.toUpperCase()} - KHỐI: ${exam?.grade ?? '__'}`, bold: true })], alignment: AlignmentType.CENTER }),
                  new Paragraph({ children: [new TextRun({ text: `Thời gian làm bài: ${duration} phút`, bold: true })], alignment: AlignmentType.CENTER }),
                  new Paragraph({ children: [new TextRun({ text: `Mã đề: ${exam?.examCode || '____'}`, bold: true })], alignment: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
        ],
      })
    );
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

    children.push(new Paragraph({ children: [new TextRun('Họ và tên thí sinh: ....................................................................................')] }));
    children.push(new Paragraph({ children: [new TextRun('Lớp: .............')], spacing: { after: 200 } }));

    // ===== I. TRẮC NGHIỆM KHÁCH QUAN =====
    children.push(new Paragraph({ children: [new TextRun({ text: 'I. TRẮC NGHIỆM KHÁCH QUAN', bold: true, size: 28 })], spacing: { after: 100 } }));

    // --- Phần 1. Trắc nghiệm nhiều lựa chọn ---
    if (mcQuestions.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 1. Trắc nghiệm nhiều lựa chọn', bold: true, size: 24 })], spacing: { before: 200, after: 100 } }));
      mcQuestions.forEach((q, idx) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Câu ${idx + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
          spacing: { after: 50 },
        }));

        const answers = Array.from({ length: 6 }, (_, i) => q?.[`answer${i + 1}`]).filter(v => hasText(v));
        const answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const perLine = answers.length >= 5 ? 6 : (answers.length >= 2 ? 4 : 1);
        let row = [];
        answers.forEach((a, i) => {
          row.push(new TextRun({ text: `${answerLetters[i]}. `, bold: true }), new TextRun(`${a}   `));
          if ((i + 1) % perLine === 0 || i === answers.length - 1) {
            children.push(new Paragraph({ children: row, spacing: { after: 100 } }));
            row = [];
          }
        });
      });
    }

    // --- Phần 2. Trắc nghiệm Đúng/Sai ---
    if (tfQuestions.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 2. Trắc nghiệm Đúng/Sai', bold: true, size: 24 })], spacing: { before: 200, after: 100 } }));
      tfQuestions.forEach((q, idx) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Câu ${idx + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
          spacing: { after: 50 },
        }));
        const answers = [q?.answer1, q?.answer2].filter(v => hasText(v));
        if (answers.length) {
          const labels = ['A', 'B'];
          children.push(new Paragraph({
            children: answers.flatMap((a, i) => [new TextRun({ text: `${labels[i]}. `, bold: true }), new TextRun(`${a}   `)]),
            spacing: { after: 100 },
          }));
        }
      });
    }

    // --- Phần 3. Trắc nghiệm trả lời ngắn ---
    if (saQuestions.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 3. Trắc nghiệm trả lời ngắn', bold: true, size: 24 })], spacing: { before: 200, after: 100 } }));
      saQuestions.forEach((q, idx) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Câu ${idx + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
          spacing: { after: 50 },
        }));
      });
    }

    // ===== II. TỰ LUẬN =====
    if (essayQuestions.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Phần II: TỰ LUẬN', bold: true })], spacing: { before: 200, after: 100 } }));
      essayQuestions.forEach((q, idx) => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Câu ${idx + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
          spacing: { after: 50 },
        }));
      });
    }

    // ===== BẢNG ĐÁP ÁN (2 hàng, cột đều nhau, 10 câu/1 hàng) =====
    addAnswerTables(children, mcQuestions.length, 'ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN');
    addAnswerTables(children, tfQuestions.length, 'ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI');
    addAnswerTables(children, saQuestions.length, 'ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN');

    // ===== PACK & SAVE =====
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const fname = (exam?.title || 'DE_THI').toUpperCase().replace(/\s+/g, '_');
    saveAs(blob, `${fname}.docx`);
  };

  return (
    <section className='max-w-3xl mx-auto py-20 min-h-[600px]'>
      <div className='mb-6 flex items-center justify-between'>
        <PrimaryButton onClick={handleGoBack}>Quay lại</PrimaryButton>
        <CommonButton
          onClick={() => downloadExamFile(exam, { subject, duration })}
          className='inline-flex items-center text-[16px] gap-2 rounded-xl py-2 bg-gradient-to-r from-green-600 to-green-600 text-white shadow-sm hover:shadow-md hover:opacity-95 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-300'>
          <MdDownload size={18} />
          Tải xuống đề thi
        </CommonButton>
      </div>

      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-start justify-between'>
          <div className='text-center'>
            <div className='uppercase font-bold text-gray-900'>
              BỘ GIÁO DỤC VÀ ĐÀO TẠO
            </div>
            <div className='text-sm italic text-gray-700'>Đề minh họa</div>
          </div>

          <div className='text-center'>
            <div className='uppercase font-bold text-gray-900'>
              {exam?.title && (
                <p className='text-gray-900 mb-4'>{exam.title}</p>
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
                <h2 className='text-[22px] font-bold mb-2'>
                  {idx + 1}. {typeLabel}
                </h2>
              </div>
              {(() => {
                // Gộp tất cả câu hỏi của các section cùng loại
                const allQuestions = sections.flatMap(
                  section => section?.questions ?? []
                );
                return allQuestions.length > 0 ? (
                  allQuestions.map((q, qi) => {
                    const kind = getQuestionKind(q, sections[0]?.sectionType);
                    if (kind === 'essay')
                      return (
                        <QuestionItemEssay key={q?.id ?? qi} q={q} index={qi} />
                      );
                    if (kind === 'short')
                      return (
                        <QuestionItemShort key={q?.id ?? qi} q={q} index={qi} />
                      );
                    return (
                      <QuestionItemChoice key={q?.id ?? qi} q={q} index={qi} />
                    );
                  })
                ) : (
                  <p className='italic text-gray-500'>
                    Chưa có câu hỏi nào trong phần này.
                  </p>
                );
              })()}
            </div>
          ))}
        </>
      )}
    </section>
  );
};

export default ExamDetail;
