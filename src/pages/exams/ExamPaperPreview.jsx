import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from './QuestionSelectionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from "html2canvas";
import _ from 'lodash';
import {
  postQuestionSection
} from '@/services/questionService';

const handleSectionType = sectionType => {
  switch (sectionType) {
    case 'MultipleChoice':
      return 'Trắc nghiệm nhiều đáp án';
    case 'TrueFalse':
      return 'Trắc nghiệm Đúng/Sai';
    case 'ShortAnswer':
      return 'Câu hỏi trả lời ngắn';
    case 'Essay':
      return 'Tự luận';
    default:
      return sectionType ?? '';
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
  const [ministryOfEducationAndTraining, setMinistryOfEducationAndTraining] =
    useState('');
  const [school, setSchool] = useState('');
  const [durationTime, setDurationTime] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const examContentRef = useRef(null);

  // sort an toàn
  const sortedSections = [...(sectionsCreated ?? [])].sort(
    (a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0)
  );

  if (!examData) {
    return (
      <div className='text-center text-gray-500'>
        Không có dữ liệu đề thi để hiển thị.
      </div>
    );
  }

  // Cảnh báo khi không có ma trận toàn cục
  const isMatrixMissing =
    !Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0;

  useEffect(() => {
    if (isMatrixMissing) {
      toast.warn(
        'Không tìm thấy chi tiết ma trận. Vui lòng cấu hình Ma trận đề trước khi chọn câu hỏi.'
      );
    }
  }, [isMatrixMissing]);

  const groupBySectionType = data => {
    if (!Array.isArray(data)) return {};
    return data.reduce((accumulator, currentItem) => {
      const sectionType = currentItem?.data?.sectionType;
      if (!sectionType) return accumulator;
      (accumulator[sectionType] ??= []).push(currentItem);
      return accumulator;
    }, {});
  };

  const groupedData = groupBySectionType(sortedSections);

  // Đảm bảo mỗi key trong order luôn có mảng (kể cả rỗng)
  const sortedGroupedData = SAFE_ORDER.map(key => ({
    [key]: groupedData[key] ?? [],
  }));

  const computeCanGenerate = () => {
    if (!Array.isArray(matrixSectionDetail) || matrixSectionDetail.length === 0)
      return false;

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

        const quantity = matrixItems.reduce(
          (sum, d) => sum + (d?.quantity ?? 0),
          0
        );
        const selectedCount = (levelSections ?? []).reduce((sum, s) => {
          return sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length;
        }, 0);

        if (quantity > 0 && selectedCount < quantity) return false;
      }
    }
    return true;
  };

  // Kết quả để disable nút
  const canGenerate = useMemo(
    () => computeCanGenerate(),
    [matrixSectionDetail, groupedData, selectedQuestionsBySection]
  );

  const validateMatrixAndSelections = () => {
    const issues = [];

    if (
      !Array.isArray(matrixSectionDetail) ||
      matrixSectionDetail.length === 0
    ) {
      issues.push('Chưa có chi tiết ma trận.');
      return { ok: false, issues };
    }

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

        const hasMatrixForLevel = matrixItems.length > 0;
        const quantity = matrixItems.reduce(
          (sum, d) => sum + (d?.quantity ?? 0),
          0
        );
        const selectedCount = (levelSections ?? []).reduce((sum, s) => {
          return sum + (selectedQuestionsBySection?.[s?.data?.id] ?? []).length;
        }, 0);

        if (!hasMatrixForLevel) {
          issues.push(
            `Thiếu cấu hình ma trận cho "${handleSectionType(
              sectionType
            )}" - mức "${levelName}".`
          );
        } else if (quantity > 0 && selectedCount < quantity) {
          issues.push(
            `Chưa đủ câu cho "${handleSectionType(
              sectionType
            )}" - mức "${levelName}": đã chọn ${selectedCount}/${quantity}.`
          );
        }
      }
    }

    return { ok: issues.length === 0, issues };
  };

  const groupedSectionsByTitle = sortedSections.reduce((acc, section) => {
    const groupKey = section?.data?.title ?? '';
    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: section?.data?.title ?? '',
        displayOrder: section?.data?.displayOrder ?? 0,
        details: [],
      };
    }
    acc[groupKey].details.push(section);
    return acc;
  }, {});
  const orderedGroupedSectionsByTitle = Object.values(
    groupedSectionsByTitle
  ).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const handleOpenQuestionModal = (
    sectionId,
    sectionType,
    levelName,
    quantityLimit
  ) => {
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

  const handleSaveSelectedQuestions = (sectionId, questions) => {
    onQuestionsSelected?.(sectionId, questions);
    handleCloseQuestionModal();
  };

  const handleDownloadWord = async () => {
    setIsConfirmModalOpen(false);
    try {
      // Xáo trộn các câu hỏi theo từng typeName (sectionType)
      const shuffleQuestionsByType = () => {
        // Gom tất cả câu hỏi theo typeName
        const typeToQuestions = {};
        for (const section of sectionsCreated ?? []) {
          const sectionId = section?.data?.id;
          const typeName = section?.data?.sectionType;
          if (!typeName || !selectedQuestionsBySection?.[sectionId]) continue;
          if (!typeToQuestions[typeName]) typeToQuestions[typeName] = [];
          typeToQuestions[typeName].push(
            ...selectedQuestionsBySection[sectionId]
          );
        }
        // Xáo trộn từng nhóm typeName
        for (const type in typeToQuestions) {
          typeToQuestions[type] = _.shuffle(typeToQuestions[type]);
        }
        // Phân bổ lại vào từng sectionId theo thứ tự cũ (giữ số lượng mỗi section)
        const result = {};
        for (const section of sectionsCreated ?? []) {
          const sectionId = section?.data?.id;
          const typeName = section?.data?.sectionType;
          const originalQuestions = selectedQuestionsBySection?.[sectionId] ?? [];
          if (!typeName || originalQuestions.length === 0) continue;
          result[sectionId] = typeToQuestions[typeName].splice(0, originalQuestions.length);
        }
        return result;
      };

      // Số version đề thi cần tạo
      const versionCount =
        examData?.randomizeQuestions && examData?.versionCount
          ? examData.versionCount
          : 1;

      for (let version = 1; version <= versionCount; version++) {
        const questionsForThisVersion =
          examData?.randomizeQuestions
            ? shuffleQuestionsByType()
            : selectedQuestionsBySection;

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
                        new TextRun({
                          text: `SỞ GIÁO DỤC VÀ ĐÀO TẠO ${ministryOfEducationAndTraining}`,
                          bold: true,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `TRƯỜNG THPT ${school}`,
                          bold: true,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '🙢★🙠',
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
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
                          bold: true,
                          size: 28,
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
                          text: `Thời gian làm bài: ${durationTime || '45 phút'}`,
                          bold: true,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Mã đề: ${version ? version : '____'
                            }`,
                          bold: true,
                        }),
                      ],
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

        // Thông tin học sinh/lớp
        children.push(
          new Paragraph({
            children: [
              new TextRun(
                'Họ và tên thí sinh: ....................................................................................'
              ),
            ],
          })
        );
        children.push(
          new Paragraph({
            children: [new TextRun('Lớp: .............')],
            spacing: { after: 200 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'I. TRẮC NGHIỆM KHÁCH QUAN',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        // Gom nhóm theo loại (dùng title đã map)
        const groupedSectionsForDoc = [...(sectionsCreated ?? [])]
          .sort(
            (a, b) => (a?.data?.displayOrder ?? 0) - (b?.data?.displayOrder ?? 0)
          )
          .reduce((acc, section) => {
            const groupKey = handleSectionType(section?.data?.sectionType);
            if (!groupKey) return acc;
            (acc[groupKey] ??= {
              title: groupKey,
              displayOrder: section?.data?.displayOrder ?? 0,
              details: [],
            }).details.push(section);
            return acc;
          }, {});
        const orderedGroupedSections = Object.values(groupedSectionsForDoc).sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );

        let multipleChoiceQuestionCount = 0;
        let trueFalseQuestionCount = 0;
        let shortAnswerQuestionCount = 0;

        for (const group of orderedGroupedSections) {
          let questionCounter = 1;
          let partTitle = '';
          switch (group.title) {
            case 'Trắc nghiệm nhiều đáp án':
              partTitle = 'Phần 1. Trắc nghiệm nhiều lựa chọn';
              break;
            case 'Trắc nghiệm Đúng/Sai':
              partTitle = 'Phần 2. Trắc nghiệm Đúng/Sai';
              break;
            case 'Câu hỏi trả lời ngắn':
              partTitle = 'Phần 3. Trắc nghiệm trả lời ngắn';
              break;
            case 'Tự luận':
              partTitle = 'Phần II: TỰ LUẬN';
              break;
            default:
              partTitle = group.title;
          }

          children.push(
            new Paragraph({
              children: [new TextRun({ text: partTitle, bold: true, size: 26 })],
              spacing: { before: 200, after: 100 },
            })
          );

          for (const s of group.details ?? []) {
            // Sử dụng câu hỏi đã xáo trộn cho version này
            const questions = questionsForThisVersion?.[s?.data?.id] ?? [];

            if (s?.data?.sectionType === 'MultipleChoice') {
              multipleChoiceQuestionCount += questions.length;
            } else if (s?.data?.sectionType === 'TrueFalse') {
              trueFalseQuestionCount += questions.length;
            } else if (s?.data?.sectionType === 'ShortAnswer') {
              shortAnswerQuestionCount += questions.length;
            }

            for (const q of questions) {
              // Câu hỏi
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `Câu ${questionCounter}. `, bold: true }),
                    new TextRun(q?.content ?? ''),
                  ],
                  spacing: { after: 50 },
                })
              );

              // Ảnh câu hỏi (nếu có)
              const images = q?.questionImg?.data?.data;
              if (Array.isArray(images) && images.length > 0) {
                for (const image of images) {
                  try {
                    if (!image?.url) continue;
                    const response = await fetch(image.url);
                    const arrayBuffer = await response.arrayBuffer();

                    const imageParagraph = new Paragraph({
                      children: [
                        new ImageRun({
                          data: arrayBuffer,
                          transformation: { width: 400, height: 300 },
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 200 },
                    });

                    children.push(imageParagraph);
                  } catch (error) {
                    console.error(
                      `Lỗi khi tải hình ảnh từ URL ${image?.url} cho câu hỏi ${questionCounter}:`,
                      error
                    );
                    children.push(
                      new Paragraph({
                        text: `[Không thể tải hình ảnh từ URL: ${image?.url}]`,
                      })
                    );
                  }
                }
              }

              if (
                s?.data?.sectionType === 'MultipleChoice' ||
                s?.data?.sectionType === 'TrueFalse'
              ) {
                const answerLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                const allAnswers = [];

                for (let i = 1; i <= 6; i++) {
                  const key = `answer${i}`;
                  if (q?.[key]) {
                    allAnswers.push({
                      letter: answerLetters[i - 1],
                      text: q[key],
                    });
                  }
                }

                const numAnswers = allAnswers.length;
                let answersPerLine = 2;

                const hasLongAnswer = allAnswers.some(
                  ans =>
                    (ans.text?.length ?? 0) > 50 ||
                    String(ans.text).includes('\n')
                );

                if (hasLongAnswer) answersPerLine = 1;
                else if (numAnswers >= 5) answersPerLine = 6;
                else if (numAnswers >= 2) answersPerLine = 4;
                else answersPerLine = 1;

                let currentLineChildren = [];
                allAnswers.forEach((ans, index) => {
                  currentLineChildren.push(
                    new TextRun({ text: `${ans.letter}. `, bold: true }),
                    new TextRun({ text: `${ans.text}   ` })
                  );

                  if (
                    (index + 1) % answersPerLine === 0 ||
                    index === numAnswers - 1
                  ) {
                    if (currentLineChildren.length > 0) {
                      children.push(
                        new Paragraph({
                          children: currentLineChildren,
                          spacing: { after: 100 },
                        })
                      );
                      currentLineChildren = [];
                    }
                  }
                });
              }

              questionCounter++;
            }
          }
        }
        const chunkSize = 10;
        const FIRST_COL_PCT = 8;
        const NUM_COL_PCT_MC = multipleChoiceQuestionCount > 0 ? (100 - FIRST_COL_PCT) / multipleChoiceQuestionCount : (100 - FIRST_COL_PCT);
        const NUM_COL_PCT_TF = NUM_COL_PCT_MC;
        const NUM_COL_PCT_SA = NUM_COL_PCT_MC;

        // Bảng đáp án phần Trắc nghiệm nhiều lựa chọn
        if (multipleChoiceQuestionCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= multipleChoiceQuestionCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, multipleChoiceQuestionCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

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
              headerCells.push(
                new TableCell({
                  width: { size: NUM_COL_PCT, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })],
                  verticalAlign: VerticalAlign.CENTER,
                })
              );
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
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                },
              })
            );

            children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          }
        }

        // Bảng đáp án phần Đúng/Sai
        if (trueFalseQuestionCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= trueFalseQuestionCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, trueFalseQuestionCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

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
              headerCells.push(
                new TableCell({
                  width: { size: NUM_COL_PCT, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })],
                  verticalAlign: VerticalAlign.CENTER,
                })
              );
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
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                },
              })
            );

            children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          }
        }

        // Bảng đáp án phần Trả lời ngắn
        if (shortAnswerQuestionCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= shortAnswerQuestionCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, shortAnswerQuestionCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

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
              headerCells.push(
                new TableCell({
                  width: { size: NUM_COL_PCT, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: `${i}`, alignment: AlignmentType.CENTER })],
                  verticalAlign: VerticalAlign.CENTER,
                })
              );
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
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                },
              })
            );

            children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
          }
        }

        const doc = new Document({
          sections: [{ properties: {}, children }],
        });

        const blob = await Packer.toBlob(doc);
        let fileName = (examData?.title ?? 'DE_THI').toUpperCase();
        if (versionCount > 1) {
          fileName += `_V${version}`;
        }
        saveAs(blob, `${fileName}.docx`);
      }
      toast.success(
        versionCount > 1
          ? `Đã tải xuống ${versionCount} version đề thi Word!`
          : 'Đề thi Word đã được tải xuống!'
      );
    } catch (error) {
      console.error('Lỗi khi tải xuống đề thi Word:', error);
      toast.error('Không thể tải xuống đề thi Word. Vui lòng thử lại.');
    }
  };

  const handleDownloadPdf = async () => {
    setIsConfirmModalOpen(false);
    toast.info('Đang phát triển chức năng!');
  };

  const handleDownloadExam = async () => {
    const { ok, issues } = validateMatrixAndSelections();
    if (!ok) {
      issues.forEach(msg => toast.warn(msg));
      toast.error(
        'Không thể tạo/tải đề. Vui lòng hoàn thiện ma trận và chọn đủ câu theo ma trận'
      );
      return;
    }

    try {
      for (const sectionId in selectedQuestionsBySection) {
        const questions = selectedQuestionsBySection[sectionId] || [];
        for (const q of questions) {
          await postQuestionSection({
            questionId: q.id,
            sectionId: sectionId,
          });
        }
      }
    } catch (err) {
      toast.error('Lỗi khi lưu dữ liệu câu hỏi vào đề thi!');
      return;
    }

    handleDownloadWord();
  };

  return (
    <div
      className='bg-white p-6 rounded-lg shadow-md space-y-6'
      ref={examContentRef}
    >
      {/* Banner cảnh báo ma trận nếu thiếu */}
      {isMatrixMissing && (
        <div className='rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3'>
          <p className='text-sm'>
            <strong>Chưa có chi tiết ma trận.</strong> Một số phần sẽ bị vô hiệu
            hoá thao tác chọn câu hỏi. Vui lòng vào <em>Ma trận</em> để cấu hình
            số lượng câu theo loại & mức độ hoặc chọn 1 ma trận khác.
          </p>
        </div>
      )}

      {/* Khung thông tin đề thi */}
      <div className='border border-gray-300 p-4 rounded-md grid grid-cols-2 gap-4'>
        {/* Khung bên trái */}
        <div className='col-span-1 border-r border-gray-200 pr-4 space-y-2'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              SỞ GIÁO DỤC VÀ ĐÀO TẠO
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1 uppercase'
              placeholder='Nhập tên Sở GDĐT'
              onChange={e => setMinistryOfEducationAndTraining(e.target.value)}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 uppercase'>
              TRƯỜNG THPT
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Nhập tên Trường THPT'
              onChange={e => setSchool(e.target.value)}
            />
          </div>
          <div className='text-center'>
            <p>🙢★🙠</p>
          </div>
        </div>

        {/* Khung bên phải */}
        <div className='col-span-1 pl-4 space-y-2'>
          <p className='text-md font-bold text-gray-800 uppercase'>
            {examData?.title ?? 'Tiêu đề đề thi'}
          </p>
          <p className='text-md text-gray-700'>
            MÔN: VẬT LÍ - KHỐI: {examData?.grade ?? '__'}
          </p>
          <div className='flex'>
            <label className='flex items-center text-md font-medium text-gray-700'>
              Thời gian làm bài:
            </label>
            <input
              type='text'
              className='w-30 ml-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Ví dụ: 45 phút'
              onChange={e => setDurationTime(e.target.value)}
            />
          </div>
          <p className='text-md text-gray-700'>Mã đề:</p>
        </div>
      </div>

      <hr className='my-4' />

      <h3 className='text-xl font-bold text-indigo-700 text-center mb-4'>
        Cấu trúc đề thi
      </h3>

      {sortedGroupedData.map(groupObject => {
        const [sectionType, sections] = Object.entries(groupObject)[0];

        let sectionTitle = '';
        switch (sectionType) {
          case 'MultipleChoice':
            sectionTitle =
              'Phần 1: Trắc nghiệm khách quan - Trắc nghiệm nhiều đáp án';
            break;
          case 'TrueFalse':
            sectionTitle = 'Phần 1: Trắc nghiệm khách quan - Câu hỏi Đúng/Sai';
            break;
          case 'ShortAnswer':
            sectionTitle =
              'Phần 1: Trắc nghiệm khách quan - Câu hỏi trả lời ngắn';
            break;
          case 'Essay':
            sectionTitle = 'Phần 2: Tự luận';
            break;
          default:
            sectionTitle = sectionType;
        }

        const groupedByLevel = (sections ?? []).reduce((acc, currentItem) => {
          const levelName = currentItem?.levelName;
          if (!levelName) return acc;
          (acc[levelName] ??= []).push(currentItem);
          return acc;
        }, {});

        return (
          <div
            key={sectionType}
            className='border border-gray-200 p-4 rounded-md mt-4'
          >
            <h4 className='text-lg font-semibold text-gray-800 mb-3'>
              {sectionTitle}
            </h4>

            {Object.entries(groupedByLevel ?? {}).sort(([a], [b]) => {
              const order = { Easy: 1, Medium: 2, Hard: 3 };
              return order[a] - order[b];
            })
              .map(([levelName, levelSections]) => {
                const levelMapping = {
                  Easy: 'Nhận Biết',
                  Medium: 'Thông Hiểu',
                  Hard: 'Vận Dụng',
                };
                const newLevelName = levelMapping[levelName] || levelName;

                const correspondingMatrixDetail = (
                  matrixSectionDetail ?? []
                ).filter(
                  detail =>
                    detail?.typeName === sectionType &&
                    detail?.levelName === levelName
                );

                const hasMatrixForLevel =
                  (correspondingMatrixDetail?.length ?? 0) > 0;

                const quantity = correspondingMatrixDetail.reduce(
                  (sum, detail) => sum + (detail?.quantity ?? 0),
                  0
                );

                const currentSelectedCount = (levelSections ?? []).reduce(
                  (sum, s) => {
                    return (
                      sum +
                      (selectedQuestionsBySection?.[s?.data?.id] ?? []).length
                    );
                  },
                  0
                );

                const firstSectionId = levelSections?.[0]?.data?.id;

                return (
                  <div
                    key={levelName}
                    className='ml-4 border-l-2 border-indigo-300 pl-4 py-2 my-2 bg-gray-50 rounded-md'
                  >
                    <p className='font-medium text-gray-700 mb-1'>
                      Mức độ: {newLevelName}
                    </p>
                    <p className='text-gray-600 mb-2'>
                      Số lượng câu hỏi: {quantity}
                    </p>

                    {/* Cảnh báo theo từng mức độ khi không có cấu hình */}
                    {!hasMatrixForLevel && (
                      <div className='mb-2 rounded border border-amber-300 bg-amber-50 text-amber-800 px-2 py-1 text-sm'>
                        Chưa có cấu hình ma trận cho{' '}
                        <strong>{handleSectionType(sectionType)}</strong> – mức
                        độ <strong>{newLevelName}</strong>. Vui lòng vào Ma trận
                        để thêm số lượng câu hỏi.
                      </div>
                    )}

                    <div className='flex items-center justify-between p-2 bg-white border border-dashed border-gray-200 rounded-md'>
                      <span className='text-gray-700'>
                        Đã chọn: {currentSelectedCount} / {quantity} câu hỏi.
                      </span>
                      <PrimaryButton
                        className='bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 disabled:opacity-60 disabled:cursor-not-allowed'
                        onClick={() =>
                          handleOpenQuestionModal(
                            firstSectionId,
                            sectionType,
                            levelName,
                            quantity
                          )
                        }
                        disabled={
                          !firstSectionId ||
                          !hasMatrixForLevel ||
                          quantity === 0
                        }
                        title={
                          !firstSectionId
                            ? 'Không có section phù hợp'
                            : !hasMatrixForLevel || quantity === 0
                            ? 'Chưa có cấu hình ma trận cho mức độ này'
                            : ''
                        }
                      >
                        Chọn câu hỏi
                      </PrimaryButton>
                    </div>

                    <ul className='mt-2'>
                      {(levelSections ?? []).map(s =>
                        (selectedQuestionsBySection?.[s?.data?.id] ?? []).map(
                          (q, index, array) => (
                            <li
                              key={q?.id ?? `${s?.data?.id}-${index}`}
                              className={`text-gray-700 text-sm flex items-start ${
                                index < array.length - 1
                                  ? 'border-b border-gray-200 pb-2 mb-2'
                                  : ''
                              }`}
                            >
                              <span className='font-semibold mr-2 flex-shrink-0'>
                                {index + 1}.
                              </span>
                              <span style={{ whiteSpace: 'normal' }}>
                                <MathJaxContext
                                  config={{ tex: { inlineMath: [['$', '$']] } }}
                                >
                                  <MathJax dynamic>{q?.content ?? ''}</MathJax>
                                </MathJaxContext>
                              </span>
                            </li>
                          )
                        )
                      )}
                    </ul>
                  </div>
                );
              }
            )}
          </div>
        );
      })}

      <div className='flex justify-between mt-6'>
        <PrimaryButton
          className='bg-gray-500 hover:bg-gray-600 text-white'
          onClick={onBack}
        >
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className='bg-green-500 hover:bg-green-600 text-white disabled:opacity-60 disabled:cursor-not-allowed'
          onClick={handleDownloadExam}
          disabled={!canGenerate}
          title={
            !canGenerate
              ? 'Chưa thể tạo đề: thiếu ma trận hoặc chưa chọn đủ câu theo ma trận'
              : ''
          }
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
          initialSelectedQuestions={
            selectedQuestionsBySection?.[currentSectionToSelect.id] ?? []
          }
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}
    </div>
  );
};

export default ExamPaperPreview;
