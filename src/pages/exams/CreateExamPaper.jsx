import { useState, useRef } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualExamForm from './ManualExamForm';
import AutoExamForm from './AutoExamForm';
import {
  postExam,
  getExamByCategoryById,
  generateAutoExam,
} from '@/services/examService';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
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
} from 'docx';
import { createSection } from '@/services/sectionService';
import ExamPaperPreview from './ExamPaperPreview';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';

const CreateExamPaper = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const manualFormRef = useRef(null);
  const autoFormRef = useRef(null);
  const [examCreatedData, setExamCreatedData] = useState(null);
  const [matrixSectionDetail, setmatrixSectionDetail] = useState(null);
  const [sectionsCreated, setSectionsCreated] = useState(null);
  const [selectedQuestionsBySection, setSelectedQuestionsBySection] = useState(
    {}
  );
  const [loading, setLoading] = useState(false);

  const generateAutoExamDocx = async (responseAiData, examTitle, versionCfg) => {
    try {
      // ---- Helpers ----
      const toNumber = (v, def = 1) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : def;
      };

      const normalizeVersionCfg = (cfg) => {
        if (typeof cfg === 'number') {
          return { versionCount: toNumber(cfg, 1), randomizeQuestions: true, randomizeOptions: false };
        }
        if (cfg && typeof cfg === 'object') {
          return {
            versionCount: toNumber(cfg.versionCount, 1),
            randomizeQuestions: cfg.randomizeQuestions ?? true,
            randomizeOptions: cfg.randomizeOptions ?? false,
          };
        }
        return { versionCount: 1, randomizeQuestions: true, randomizeOptions: false };
      };

      const { versionCount, randomizeQuestions, randomizeOptions } = normalizeVersionCfg(versionCfg);

      const shuffle = (arr) => {
        const a = Array.isArray(arr) ? [...arr] : [];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      // --- Nếu cần xáo TRONG câu hỏi (A/B/C/D), dùng hàm này ---
      const shuffleOptionsIfNeeded = (q) => {
        let opts = [
          { letter: 'A', text: q?.option1 },
          { letter: 'B', text: q?.option2 },
          { letter: 'C', text: q?.option3 },
          { letter: 'D', text: q?.option4 },
        ].filter(o => o.text !== undefined && o.text !== null && String(o.text).trim() !== '');

        if (opts.length === 0) return [];

        if (randomizeOptions) {
          opts = shuffle(opts);
        }

        const letters = ['A', 'B', 'C', 'D'];
        return opts.map((o, idx) => ({ letter: letters[idx], text: o.text }));
      };

      const originalMC = responseAiData?.data?.multiple_choice ?? [];
      const originalTF = responseAiData?.data?.true_false ?? [];
      const originalSA = responseAiData?.data?.short_answer ?? [];
      const originalEssay = responseAiData?.data?.essay ?? [];

      // --- Sinh từng version ---
      for (let ver = 1; ver <= versionCount; ver++) {
        // Xáo trộn câu hỏi theo loại khi được bật
        const mcList = randomizeQuestions ? shuffle(originalMC) : [...originalMC];
        const tfList = randomizeQuestions ? shuffle(originalTF) : [...originalTF];
        const saList = randomizeQuestions ? shuffle(originalSA) : [...originalSA];
        const essayList = randomizeQuestions ? shuffle(originalEssay) : [...originalEssay];

        const children = [];

        // ===== HEADER =====
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
                    new Paragraph({ children: [new TextRun({ text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO', bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: 'TRƯỜNG THPT', bold: true })], alignment: AlignmentType.CENTER }),
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
                    new Paragraph({ children: [new TextRun({ text: (examTitle || 'ĐỀ THI').toUpperCase(), bold: true, size: 28 })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: 'MÔN: VẬT LÍ - KHỐI: 12', bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: 'Thời gian làm bài: 45 phút', bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: `Mã đề: ${String(ver).padStart(2, '0')}`, bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),
          ],
        });

        children.push(headerTable);
        children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

        // ===== THÔNG TIN THÍ SINH =====
        children.push(new Paragraph({ children: [new TextRun('Họ và tên thí sinh: ....................................................................................')] }));
        children.push(new Paragraph({ children: [new TextRun('Lớp: .............')], spacing: { after: 200 } }));

        // ===== I. TRẮC NGHIỆM KHÁCH QUAN =====
        children.push(new Paragraph({ children: [new TextRun({ text: 'I. TRẮC NGHIỆM KHÁCH QUAN', bold: true, size: 28 })], spacing: { after: 100 } }));

        // --- Phần 1. Nhiều lựa chọn ---
        let mcCount = 0;
        children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 1. Trắc nghiệm nhiều lựa chọn', bold: true })], spacing: { before: 200, after: 100 } }));

        for (let i = 0; i < mcList.length; i++) {
          const q = mcList[i];
          mcCount++;
          children.push(new Paragraph({
            children: [new TextRun({ text: `Câu ${i + 1}. `, bold: true }), new TextRun(q?.question ?? '')],
            spacing: { after: 50 },
          }));

          const answers = shuffleOptionsIfNeeded(q);
          for (const ans of answers) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `${ans.letter}. `, bold: true }), new TextRun(String(ans.text ?? ''))],
              spacing: { after: 50 },
            }));
          }
        }

        // --- Phần 2. Đúng/Sai ---
        let tfCount = 0;
        children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 2. Trắc nghiệm Đúng/Sai', bold: true })], spacing: { before: 200, after: 100 } }));

        for (let i = 0; i < tfList.length; i++) {
          const q = tfList[i];
          tfCount++;
          children.push(new Paragraph({
            children: [new TextRun({ text: `Câu ${i + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
            spacing: { after: 50 },
          }));
          const tfAnswers = shuffleOptionsIfNeeded(q);

          for (const ans of tfAnswers) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `${ans.letter}. `, bold: true }), new TextRun(String(ans.text ?? ''))],
              spacing: { after: 50 },
            }));
          }
        }

        // --- Phần 3. Trả lời ngắn ---
        let saCount = 0;
        children.push(new Paragraph({ children: [new TextRun({ text: 'Phần 3. Trắc nghiệm trả lời ngắn', bold: true })], spacing: { before: 200, after: 100 } }));

        for (let i = 0; i < saList.length; i++) {
          const q = saList[i];
          saCount++;
          children.push(new Paragraph({
            children: [new TextRun({ text: `Câu ${i + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
            spacing: { after: 50 },
          }));
        }

        // ===== II. TỰ LUẬN =====
        children.push(new Paragraph({ children: [new TextRun({ text: 'Phần II: TỰ LUẬN', bold: true })], spacing: { before: 200, after: 100 } }));

        for (let i = 0; i < essayList.length; i++) {
          const q = essayList[i];
          children.push(new Paragraph({
            children: [new TextRun({ text: `Câu ${i + 1}. `, bold: true }), new TextRun(q?.content ?? '')],
            spacing: { after: 50 },
          }));
        }
        const chunkSize = 10;
        const FIRST_COL_PCT = 8; // cột "Câu/Đáp án"
        const NUM_COL_PCT_MC = mcCount > 0 ? (100 - FIRST_COL_PCT) / mcCount : (100 - FIRST_COL_PCT);
        const NUM_COL_PCT_TF = NUM_COL_PCT_MC; // dùng lại chuẩn MC
        const NUM_COL_PCT_SA = NUM_COL_PCT_MC; // dùng lại chuẩn MC

        // Bảng đáp án phần Trắc nghiệm nhiều lựa chọn
        if (mcCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= mcCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, mcCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

            // Hàng 1: "Câu" + số câu
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

            // Hàng 2: "Đáp án" + ô trống
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

            children.push(new Paragraph({ text: '', spacing: { after: 200 } })); // khoảng trống giữa các bảng con
          }
        }

        // Bảng đáp án phần Đúng/Sai
        if (tfCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= tfCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, tfCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

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
        if (saCount > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN', bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            })
          );

          for (let start = 1; start <= saCount; start += chunkSize) {
            const end = Math.min(start + chunkSize - 1, saCount);
            const colsInThisChunk = end - start + 1;
            const NUM_COL_PCT = (100 - FIRST_COL_PCT) / colsInThisChunk;

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

        // ===== PACK & SAVE =====
        const doc = new Document({ sections: [{ children }] });
        const blob = await Packer.toBlob(doc);
        const base = (examTitle || 'DE_THI').toUpperCase().replace(/\s+/g, '_');
        const file = versionCount > 1 ? `${base}_V${ver}.docx` : `${base}.docx`;
        saveAs(blob, file);
      }

      toast?.success?.(
        versionCount > 1
          ? `Đã tải xuống ${versionCount} version đề thi Word!`
          : 'Đề thi Word đã được tải xuống!'
      );
    } catch (error) {
      console.error('Lỗi xuất file Word AI:', error);
      toast?.error?.('Không thể tải xuống đề thi AI.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (activeTab === 'manual') {
      const formData = manualFormRef.current?.getFormData();
      const selectedMatrixId = manualFormRef.current?.getSelectedMatrixId();

      if (formData && selectedMatrixId) {
        try {
          setLoading(true);
          const responseData = await postExam(formData);
          const examId = responseData.data.data.id;
          const responseMatrixSection = await getMatrixSection(
            selectedMatrixId
          );
          const matrixSections = responseMatrixSection.data.data.data;
          const collectedMatrixSectionDetails = [];
          const sectionPromises = matrixSections.map(async ms => {
            const responseMatrixSectionDetail = await getMatrixSectionDetail(
              ms.id
            );
            const matrixSectionDetailData =
              responseMatrixSectionDetail.data.data;

            if (
              !matrixSectionDetailData ||
              matrixSectionDetailData.length === 0
            ) {
              console.warn(
                `Không tìm thấy chi tiết cho ID phần ma trận: ${ms.id}`
              );
              return [];
            }

            const createdSectionsForThisMatrixSection = await Promise.all(
              matrixSectionDetailData.map(async detailData => {
                collectedMatrixSectionDetails.push(detailData);

                let displayOrder;
                switch (detailData.typeName) {
                  case 'MultipleChoice':
                    displayOrder = 1;
                    break;
                  case 'TrueFalse':
                    displayOrder = 2;
                    break;
                  case 'ShortAnswer':
                    displayOrder = 3;
                    break;
                  case 'Essay':
                    displayOrder = 4;
                    break;
                  default:
                    displayOrder = 0;
                }

                const createdSection = await createSection({
                  examId: examId,
                  title: detailData.title,
                  matrixSectionId: ms.id,
                  description: detailData.description,
                  sectionType: detailData.typeName,
                  displayOrder: displayOrder,
                });
                return {
                  ...createdSection.data,
                  levelName: detailData.levelName,
                };
              })
            );
            return createdSectionsForThisMatrixSection;
          });

          const allCreatedSections = (
            await Promise.all(sectionPromises)
          ).flat();

          setExamCreatedData(responseData.data.data);
          setmatrixSectionDetail(collectedMatrixSectionDetails);
          setSectionsCreated(allCreatedSections);
          toast.success('Tạo đề thi thành công!');
        } catch (error) {
          console.error('Lỗi khi gọi API postExam:', error);
          toast.error('Có lỗi xảy ra khi tạo đề thi. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      } else {
        if (!formData) {
          toast.error('Vui lòng điền đầy đủ thông tin đề thi.');
        } else if (!selectedMatrixId) {
          toast.error('Vui lòng chọn một ma trận đề.');
        } else {
          toast.error('Có lỗi khi lấy dữ liệu form. Vui lòng thử lại.');
        }
        console.log(
          'Không thể lấy dữ liệu form thủ công hoặc chưa chọn ma trận.'
        );
      }
    } else {
      const selectedMatrixId = autoFormRef.current?.getSelectedMatrixId();
      const versionCount = autoFormRef.current?.getNumberofExamPaper();
      const examTitle = autoFormRef.current?.getExamTitle();

      if (selectedMatrixId) {
        try {
          const responseMatrix = await getMatrixById(selectedMatrixId.matrixId);
          const selectedMatrix = responseMatrix?.data?.data || {};
          // const list = Array.isArray(matrixPage.data) ? matrixPage.data : [];
          // const selectedMatrix =
          //   list.find(item => item.id === selectedMatrixId.matrixId) || null;
          const responseExamCategory = await getExamByCategoryById(
            selectedMatrix.examCategoryId
          );

          let matrixData = {};

          if (selectedMatrix) {
            setLoading(true);
            const responseSections = await getMatrixSection({ matrixId: selectedMatrix.id });
            const initialSections = responseSections?.data?.data?.data;

            if (Array.isArray(initialSections)) {
              const enrichedSectionsPromises = initialSections.map(
                async section => {
                  const contentDataResponse = await getMatrixSectionDetail(
                    section.id
                  );

                  return {
                    ...section,
                    sectionDetails: {
                      statusCode: contentDataResponse?.data.statusCode,
                      data: contentDataResponse?.data?.data?.map(item => ({
                        title: item?.title,
                        levelName: item?.levelName,
                        typeName: item?.typeName,
                        quantity: item?.quantity,
                      })),
                      message: contentDataResponse.data.message,
                      errors: contentDataResponse.data.errors,
                    },
                  };
                }
              );

              const finalSections = await Promise.all(enrichedSectionsPromises);

              const sectionStats = finalSections.map(section => {
                const totalQuestions = section?.sectionDetails?.data?.reduce(
                  (sum, item) => sum + (item?.quantity || 0),
                  0
                );

                return {
                  id: section?.id,
                  title: section?.title,
                  score: section?.score,
                  totalQuestions,
                };
              });

              const labelMap = {
                'Nhiều lựa chọn': 'Phần I. Trắc nghiệm 4 lựa chọn, 1 lựa chọn đúng',
                'Đúng/Sai': 'Phần II. Trắc nghiệm đúng sai',
                'Trả lời ngắn': 'Phần III. Trả lời ngắn',
                'Tự luận': 'Phần IV. Tự luận'
              };
              // Thứ tự hiển thị
              const sectionOrder = ['Nhiều lựa chọn', 'Đúng/Sai', 'Trả lời ngắn', 'Tự luận'];

              const bulletLines = sectionOrder
                .map(name => {
                  const s = sectionStats.find(x => x?.title === name);
                  if (!s) return null;
                  return `+ ${labelMap[name]}: ${s?.totalQuestions} Câu = ${s?.score} điểm`;
                })
                .filter(Boolean);

              // ----- Build description theo đúng format ảnh -----
              const formattedDescription = [
                `- Thời điểm kiểm tra: Kiểm tra ${responseExamCategory?.data?.data?.name.toLowerCase()}`,
                '- Hình thức kiểm tra: Kết hợp giữa trắc nghiệm và tự luận (70% trắc nghiệm, 30% tự luận).',
                '- Cấu trúc:',
                ...bulletLines
              ].join('\n');

              matrixData = {
                examType: responseExamCategory?.data?.data?.name,
                grade: selectedMatrix.grade.toString(),
                description: formattedDescription,
                year: parseInt(selectedMatrix.year),
                matrix: {
                  sections: finalSections?.map(item => ({
                    title: item?.title,
                    score: item?.levelName,
                    sectionDetails: item?.sectionDetails,
                  })),
                },
              };

              delete matrixData.sections;
            } else {
              matrixData = {
                ...selectedMatrix,
                matrix: {
                  sections: [],
                },
              };
            }
          }
          const responseAiData = await generateAutoExam(matrixData);

          if (responseAiData && responseAiData.data) {

            generateAutoExamDocx(responseAiData, examTitle.title, versionCount);
            toast.success('Tạo đề thành công!');
            window.dispatchEvent(new Event('refresh-user-coin'));
          }
        } catch (error) {
          console.error('Lỗi khi xử lý ma trận tự động:', error);
          toast.error(error?.response?.data || 'Lỗi khi tạo đề thi!');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleBackToCreateForm = () => {
    setExamCreatedData(null);
    setmatrixSectionDetail(null);
    setSectionsCreated(null);
    setSelectedQuestionsBySection({});
  };

  const handleQuestionsSelected = (sectionId, questions) => {
    setSelectedQuestionsBySection(prev => ({
      ...prev,
      [sectionId]: questions,
    }));
  };

  return (
    <>
      {/* Breadcrumb */}
      <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
        <Breadcrumb />
        {/* Form Section */}
        <div className='max-w-3xl mx-auto px-6 sm:px-12'>
          <div className='text-center max-w-md mx-auto mb-4'>
            <div className='text-blue-400 mb-3 text-4xl leading-none'>
              <i className='fas fa-graduation-cap'></i>
            </div>
            <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
              {examCreatedData ? 'Xem trước đề thi' : 'Tạo Đề Thi'}
            </h2>
          </div>
          {examCreatedData ? (
            <ExamPaperPreview
              examData={examCreatedData}
              matrixSectionDetail={matrixSectionDetail}
              sectionsCreated={sectionsCreated}
              onBack={handleBackToCreateForm}
              selectedQuestionsBySection={selectedQuestionsBySection}
              onQuestionsSelected={handleQuestionsSelected}
            />
          ) : (
            <>
              {/* Tab Navigation (chỉ hiện khi chưa tạo đề) */}
              <div className='mb-4 border-b border-gray-200'>
                <ul
                  className='flex flex-wrap -mb-px text-sm font-medium text-center'
                  role='tablist'
                >
                  <li className='mr-2' role='presentation'>
                    <button
                      className={`inline-block text-[16px] p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'manual'
                          ? 'border-indigo-600 text-indigo-600 text-[16px]'
                          : 'border-transparent text-gray-500 hover:text-gray-600 text-[16px] hover:border-gray-300'
                      }`}
                      id='manual-tab'
                      type='button'
                      role='tab'
                      aria-controls='manual'
                      aria-selected={activeTab === 'manual'}
                      onClick={() => setActiveTab('manual')}
                    >
                      Thủ công
                    </button>
                  </li>
                  <li className='mr-2' role='presentation'>
                    <button
                      className={`inline-block p-4 text-[16px] border-b-2 rounded-t-lg ${
                        activeTab === 'automatic'
                          ? 'border-indigo-600 text-indigo-600 text-[16px]'
                          : 'border-transparent text-gray-500 hover:text-gray-600 text-[16px] hover:border-gray-300'
                      }`}
                      id='automatic-tab'
                      type='button'
                      role='tab'
                      aria-controls='automatic'
                      aria-selected={activeTab === 'automatic'}
                      onClick={() => setActiveTab('automatic')}
                    >
                      Tự động
                    </button>
                  </li>
                </ul>
              </div>

              {/* Tab Content (chỉ hiện khi chưa tạo đề) */}
              <form className='space-y-4' onSubmit={handleSubmit}>
                {activeTab === 'manual' && (
                  <ManualExamForm ref={manualFormRef} />
                )}
                {activeTab === 'automatic' && (
                  <AutoExamForm ref={autoFormRef} />
                )}
                <PrimaryButton
                  className='w-full'
                  type='submit'
                  disabled={loading}
                >
                  {loading ? 'Đang tạo đề...' : 'Tạo'}
                </PrimaryButton>
              </form>
            </>
          )}
          <div className='mt-6 flex justify-end text-blue-400 text-3xl'>
            <i className='fas fa-globe-americas'></i>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateExamPaper;
