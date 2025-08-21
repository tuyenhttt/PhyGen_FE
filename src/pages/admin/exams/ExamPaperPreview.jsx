import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from '@/pages/user/exams/CreateExamPaper/QuestionSelectionModal';
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, VerticalAlign, BorderStyle, ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { postQuestionSection } from '@/services/questionService';

const handleSectionType = (sectionType) => {
  switch (sectionType) {
    case 'MultipleChoice': return 'Trắc nghiệm nhiều đáp án';
    case 'TrueFalse': return 'Trắc nghiệm Đúng/Sai';
    case 'ShortAnswer': return 'Câu hỏi trả lời ngắn';
    case 'Essay': return 'Tự luận';
    default: return sectionType ?? '';
  }
};

const SAFE_ORDER = ['MultipleChoice', 'TrueFalse', 'ShortAnswer', 'Essay'];

const ExamPaperPreview = ({
  examData,
  sectionsCreated,
  matrixSectionDetail,
  selectedQuestionsBySection,
  onBack,
  onQuestionsSelected,
}) => {
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentSectionToSelect, setCurrentSectionToSelect] = useState(null);
  const [currentQuantityLimit, setCurrentQuantityLimit] = useState(0);

  const [ministry, setMinistry] = useState('');
  const [school, setSchool] = useState('');
  const [duration, setDuration] = useState('');
  const examContentRef = useRef(null);

  if (!examData) {
    return <div className="text-center text-gray-500">Không có dữ liệu đề thi.</div>;
  }

  const sortedSections = [...(sectionsCreated ?? [])].sort(
    (a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0)
  );

  const groupedData = (arr => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, cur) => {
      const type = cur?.data?.sectionType;
      if (!type) return acc;
      (acc[type] ??= []).push(cur);
      return acc;
    }, {});
  })(sortedSections);

  const sortedGroupedData = SAFE_ORDER.map(k => ({ [k]: groupedData[k] ?? [] }));

  const computeCanGenerate = () => {
    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0) return false;

    for (const sectionType of SAFE_ORDER) {
      const sections = groupedData?.[sectionType] ?? [];
      if (sections.length === 0) continue;

      const groupedByLevel = sections.reduce((acc, s) => {
        const lv = s?.levelName;
        if (!lv) return acc;
        (acc[lv] ??= []).push(s);
        return acc;
      }, {});

      for (const [levelName, levelSections] of Object.entries(groupedByLevel)) {
        const matrixItems = (matrixSectionDetail ?? []).filter(
          d => d?.typeName === sectionType && d?.levelName === levelName
        );
        if (matrixItems.length === 0) return false;

        const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);
        const selectedCount = (levelSections ?? []).reduce((sum, s) =>
          sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0);

        if (quantity > 0 && selectedCount < quantity) return false;
      }
    }
    return true;
  };

  const canGenerate = useMemo(() => computeCanGenerate(), [
    matrixSectionDetail, groupedData, selectedQuestionsBySection
  ]);

  const handleOpenQuestionModal = (sectionId, sectionType, levelName, quantityLimit) => {
    if (!sectionId) return;
    setCurrentSectionToSelect({
      id: sectionId,
      type: handleSectionType(sectionType),
      level: levelName,
    });
    setCurrentQuantityLimit(quantityLimit ?? 0);
    setIsQuestionModalOpen(true);
  };
  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setCurrentSectionToSelect(null);
    setCurrentQuantityLimit(0);
  };
  const handleSaveSelectedQuestions = (sectionId, qs) => {
    onQuestionsSelected?.(sectionId, qs);
    handleCloseQuestionModal();
  };

  const handleDownloadWord = async () => {
    try {
      const shuffleByType = () => {
        const typeToQuestions = {};
        for (const section of sectionsCreated ?? []) {
          const sectionId = section?.data?.id;
          const typeName = section?.data?.sectionType;
          if (!typeName || !selectedQuestionsBySection?.[sectionId]) continue;
          (typeToQuestions[typeName] ??= []).push(
            ...selectedQuestionsBySection[sectionId]
          );
        }
        for (const t in typeToQuestions) {
          typeToQuestions[t] = _.shuffle(typeToQuestions[t]);
        }
        const result = {};
        for (const section of sectionsCreated ?? []) {
          const sectionId = section?.data?.id;
          const typeName = section?.data?.sectionType;
          const original = selectedQuestionsBySection?.[sectionId] ?? [];
          if (!typeName || original.length === 0) continue;
          result[sectionId] = typeToQuestions[typeName].splice(0, original.length);
        }
        return result;
      };

      const versionCount =
        examData?.randomizeQuestions && examData?.versionCount
          ? examData.versionCount
          : 1;

      for (let version = 1; version <= versionCount; version++) {
        const questionsForThisVersion =
          examData?.randomizeQuestions ? shuffleByType() : selectedQuestionsBySection;

        const children = [];

        const headerTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.TOP,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: `SỞ GD&ĐT ${ministry}`, bold: true }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: `TRƯỜNG THPT ${school}`, bold: true })],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ children: [new TextRun({ text: '🙢★🙠' })], alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.TOP,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                    right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${(examData?.title ?? 'Đề thi').toUpperCase()}`,
                          bold: true, size: 28,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `MÔN: VẬT LÍ - KHỐI: ${examData?.grade ?? '__'}`,
                          bold: true,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Thời gian làm bài: ${duration || '45 phút'}`,
                          bold: true,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: `Mã đề: ${version}`, bold: true })],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
              ],
            }),
          ],
        });

        children.push(headerTable);
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        children.push(new Paragraph({
          children: [new TextRun('Họ và tên thí sinh: ....................................................................................')],
        }));
        children.push(new Paragraph({
          children: [new TextRun('Lớp: .............')],
          spacing: { after: 200 },
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: 'I. TRẮC NGHIỆM KHÁCH QUAN', bold: true, size: 28 })],
          spacing: { after: 100 },
        }));

        const groupedSectionsForDoc = [...(sectionsCreated ?? [])]
          .sort((a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0))
          .reduce((acc, section) => {
            const key = handleSectionType(section?.data?.sectionType);
            if (!key) return acc;
            (acc[key] ??= {
              title: key,
              displayOrder: section?.data?.displayOrder ?? 0,
              details: [],
            }).details.push(section);
            return acc;
          }, {});
        const orderedGroupedSections = Object.values(groupedSectionsForDoc).sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );

        let mcCount = 0, tfCount = 0, saCount = 0;

        for (const group of orderedGroupedSections) {
          let partTitle = group.title;
          if (group.title === 'Trắc nghiệm nhiều đáp án')
            partTitle = 'Phần 1. Trắc nghiệm nhiều lựa chọn';
          else if (group.title === 'Trắc nghiệm Đúng/Sai')
            partTitle = 'Phần 2. Trắc nghiệm Đúng/Sai';
          else if (group.title === 'Câu hỏi trả lời ngắn')
            partTitle = 'Phần 3. Trắc nghiệm trả lời ngắn';
          else if (group.title === 'Tự luận')
            partTitle = 'Phần II: TỰ LUẬN';

          children.push(new Paragraph({
            children: [new TextRun({ text: partTitle, bold: true, size: 26 })],
            spacing: { before: 200, after: 100 },
          }));

          let qIndex = 1;
          for (const s of group.details ?? []) {
            const questions = questionsForThisVersion?.[s?.data?.id] ?? [];

            if (s?.data?.sectionType === 'MultipleChoice') mcCount += questions.length;
            else if (s?.data?.sectionType === 'TrueFalse') tfCount += questions.length;
            else if (s?.data?.sectionType === 'ShortAnswer') saCount += questions.length;

            for (const q of questions) {
              children.push(new Paragraph({
                children: [
                  new TextRun({ text: `Câu ${qIndex}. `, bold: true }),
                  new TextRun(q?.content ?? ''),
                ],
                spacing: { after: 50 },
              }));

              const images = q?.questionImg?.data?.data;
              if (Array.isArray(images) && images.length > 0) {
                for (const image of images) {
                  try {
                    if (!image?.url) continue;
                    const response = await fetch(image.url);
                    const buffer = await response.arrayBuffer();
                    children.push(new Paragraph({
                      children: [new ImageRun({ data: buffer, transformation: { width: 400, height: 300 } })],
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 200 },
                    }));
                  } catch (err) {
                    console.error('Lỗi tải ảnh câu hỏi:', err);
                  }
                }
              }

              if (['MultipleChoice', 'TrueFalse'].includes(s?.data?.sectionType)) {
                const letters = ['A','B','C','D','E','F'];
                const allAnswers = [];
                for (let i = 1; i <= 6; i++) {
                  const key = `answer${i}`;
                  if (q?.[key]) allAnswers.push({ letter: letters[i - 1], text: q[key] });
                }
                const longAns = allAnswers.some(a => `${a.text}`.length > 50 || `${a.text}`.includes('\n'));
                let perLine = 1;
                if (!longAns) perLine = allAnswers.length >= 5 ? 6 : (allAnswers.length >= 2 ? 4 : 1);

                let currentRuns = [];
                allAnswers.forEach((ans, idx) => {
                  currentRuns.push(new TextRun({ text: `${ans.letter}. `, bold: true }));
                  currentRuns.push(new TextRun({ text: `${ans.text}   ` }));
                  if ((idx + 1) % perLine === 0 || idx === allAnswers.length - 1) {
                    children.push(new Paragraph({ children: currentRuns, spacing: { after: 100 } }));
                    currentRuns = [];
                  }
                });
              }

              qIndex++;
            }
          }
        }

        // Answer tables
        const chunkSize = 10;
        const FIRST_COL_PCT = 8;
        const addAnswerTable = (title, count) => {
          if (!count) return;
          children.push(new Paragraph({
            children: [new TextRun({ text: title, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          }));
          for (let start = 1; start <= count; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, count);
            const colPct = (100 - FIRST_COL_PCT) / (end - start + 1);

            const headerCells = [
              new TableCell({
                width: { size: FIRST_COL_PCT, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: 'Câu', bold: true, alignment: AlignmentType.CENTER })],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ];
            const answerCells = [
              new TableCell({
                width: { size: FIRST_COL_PCT, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: 'Đáp án', bold: true, alignment: AlignmentType.CENTER })],
                verticalAlign: VerticalAlign.CENTER,
              }),
            ];

            for (let i = start; i <= end; i++) {
              headerCells.push(new TableCell({
                width: { size: colPct, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })],
                verticalAlign: VerticalAlign.CENTER,
              }));
              answerCells.push(new TableCell({
                width: { size: colPct, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })],
                verticalAlign: VerticalAlign.CENTER,
              }));
            }

            children.push(new Table({
              rows: [new TableRow({ children: headerCells }), new TableRow({ children: answerCells })],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              },
            }));

            children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          }
        };

        addAnswerTable('ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN', mcCount);
        addAnswerTable('ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI', tfCount);
        addAnswerTable('ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN', saCount);

        const doc = new Document({ sections: [{ children }] });
        const blob = await Packer.toBlob(doc);
        let fileName = (examData?.title ?? 'DE_THI').toUpperCase();
        if (versionCount > 1) fileName += `_V${version}`;
        saveAs(blob, `${fileName}.docx`);
      }

      toast.success(
        examData?.versionCount > 1
          ? `Đã tải xuống ${examData.versionCount} version đề thi Word!`
          : 'Đề thi Word đã được tải xuống!'
      );
    } catch (err) {
      console.error('Lỗi tải Word:', err);
      toast.error('Không thể tải xuống đề thi Word.');
    }
  };

  const handleDownloadExam = async () => {
    const issues = [];

    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0) {
      issues.push('Chưa có chi tiết ma trận.');
    } else {
      for (const sectionType of SAFE_ORDER) {
        const sections = groupedData?.[sectionType] ?? [];
        if (sections.length === 0) continue;

        const groupedByLevel = sections.reduce((acc, s) => {
          const lv = s?.levelName; if (!lv) return acc;
          (acc[lv] ??= []).push(s);
          return acc;
        }, {});

        for (const [levelName, levelSections] of Object.entries(groupedByLevel)) {
          const matrixItems = (matrixSectionDetail ?? []).filter(
            d => d?.typeName === sectionType && d?.levelName === levelName
          );
          const hasCfg = matrixItems.length > 0;
          const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);
          const selectedCount = (levelSections ?? []).reduce(
            (sum, s) => sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0
          );
          if (!hasCfg) {
            issues.push(`Thiếu cấu hình ma trận cho "${handleSectionType(sectionType)}" - mức "${levelName}".`);
          } else if (quantity > 0 && selectedCount < quantity) {
            issues.push(`Chưa đủ câu cho "${handleSectionType(sectionType)}" - mức "${levelName}": ${selectedCount}/${quantity}.`);
          }
        }
      }
    }

    if (issues.length) {
      issues.forEach(m => toast.warn(m));
      toast.error('Không thể tạo/tải đề. Vui lòng hoàn thiện ma trận và chọn đủ câu.');
      return;
    }

    try {
      for (const sectionId in selectedQuestionsBySection) {
        const qs = selectedQuestionsBySection[sectionId] || [];
        for (const q of qs) {
          await postQuestionSection({ questionId: q.id, sectionId });
        }
      }
    } catch (err) {
      toast.error('Lỗi khi lưu câu hỏi vào đề!');
      return;
    }

    handleDownloadWord();
  };

  // ==== UI (Admin) ====
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6" ref={examContentRef}>
      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-3">Thông tin tiêu đề</div>
          <div className="text-sm text-gray-700 space-y-2">
            <div><span className="font-medium">Tiêu đề:</span> {examData?.title ?? '—'}</div>
            <div><span className="font-medium">Khối:</span> {examData?.grade ?? '—'}</div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="font-semibold mb-3">Header hiển thị</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="SỞ GD&ĐT ..."
              onChange={e => setMinistry(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="TRƯỜNG THPT ..."
              onChange={e => setSchool(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 md:col-span-2"
              placeholder="Thời gian làm bài (vd: 45 phút)"
              onChange={e => setDuration(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Cấu trúc đề thi theo ma trận</div>
        <div className="p-4 space-y-5">
          {sortedGroupedData.map(groupObj => {
            const [sectionType, sections] = Object.entries(groupObj)[0];

            const titleMap = {
              MultipleChoice: 'Phần 1: Trắc nghiệm khách quan - Nhiều lựa chọn',
              TrueFalse: 'Phần 1: Trắc nghiệm khách quan - Đúng/Sai',
              ShortAnswer: 'Phần 1: Trắc nghiệm khách quan - Trả lời ngắn',
              Essay: 'Phần 2: Tự luận',
            };
            const sectionTitle = titleMap[sectionType] || sectionType;

            const groupedByLevel = (sections ?? []).reduce((acc, cur) => {
              const lv = cur?.levelName;
              if (!lv) return acc;
              (acc[lv] ??= []).push(cur);
              return acc;
            }, {});

            return (
              <div key={sectionType} className="rounded-lg border p-4">
                <div className="font-semibold mb-3">{sectionTitle}</div>

                {Object.entries(groupedByLevel ?? {})
                  .sort(([a], [b]) => {
                    const order = { Easy: 1, Medium: 2, Hard: 3 };
                    return (order[a] ?? 99) - (order[b] ?? 99);
                  })
                  .map(([levelName, levelSections]) => {
                    const levelMapping = { Easy: 'Nhận Biết', Medium: 'Thông Hiểu', Hard: 'Vận Dụng' };
                    const newLevelName = levelMapping[levelName] || levelName;

                    const matrixItems = (matrixSectionDetail ?? []).filter(
                      d => d?.typeName === sectionType && d?.levelName === levelName
                    );
                    const quantity = matrixItems.reduce((sum, d) => sum + (d?.quantity ?? 0), 0);

                    const selectedCount = (levelSections ?? []).reduce(
                      (sum, s) => sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length, 0
                    );

                    const firstSectionId = levelSections?.[0]?.data?.id;

                    return (
                      <div key={levelName} className="border rounded-md p-3 mb-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium">Mức độ: {newLevelName}</div>
                            <div className="text-gray-600">Số lượng câu hỏi theo ma trận: {quantity}</div>
                            <div className="text-gray-600">
                              Đã chọn: {selectedCount} / {quantity} câu
                            </div>
                          </div>
                          <PrimaryButton
                            onClick={() =>
                              handleOpenQuestionModal(firstSectionId, sectionType, levelName, quantity)
                            }
                            disabled={!firstSectionId || quantity === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Chọn câu hỏi
                          </PrimaryButton>
                        </div>

                        {/* List selected */}
                        <ul className="mt-3">
                          {(levelSections ?? []).map(s =>
                            (selectedQuestionsBySection?.[s?.data?.id] ?? []).map((q, idx, arr) => (
                              <li
                                key={q?.id ?? `${s?.data?.id}-${idx}`}
                                className={`text-sm text-gray-800 ${
                                  idx < arr.length - 1 ? 'border-b py-2' : 'pt-2'
                                }`}
                              >
                                <span className="font-semibold mr-2">{idx + 1}.</span>
                                <span style={{ whiteSpace: 'normal' }}>
                                  <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
                                    <MathJax dynamic>{q?.content ?? ''}</MathJax>
                                  </MathJaxContext>
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <PrimaryButton className="bg-gray-600 hover:bg-gray-700 text-white" onClick={onBack}>
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
          onClick={handleDownloadExam}
          disabled={!canGenerate}
          title={!canGenerate ? 'Thiếu cấu hình hoặc chưa chọn đủ câu theo ma trận' : ''}
        >
          Lưu và tải xuống Word
        </PrimaryButton>
      </div>

      {isQuestionModalOpen && currentSectionToSelect && (
        <QuestionSelectionModal
          sectionId={currentSectionToSelect?.id}
          sectionType={currentSectionToSelect?.type}
          levelName={currentSectionToSelect?.level}
          grade={examData?.grade}
          quantityLimit={currentQuantityLimit}
          initialSelectedQuestions={selectedQuestionsBySection?.[currentSectionToSelect.id] ?? []}
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}
    </div>
  );
};

export default ExamPaperPreview;
