import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
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
import { createSection } from '@/services/sectionService';
import { postQuestion, postQuestionSection } from '@/services/questionService';
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
import { saveAs } from 'file-saver';
import { IoArrowBack } from 'react-icons/io5';
import AutoExamForm from '@/pages/admin/exams/AutoExamForm';

const CreateAutoExam = () => {
  const autoFormRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const DISPLAY_ORDER = {
    MultipleChoice: 1,
    TrueFalse: 2,
    ShortAnswer: 3,
    Essay: 4,
  };

  const SECTION_TITLES = {
    MultipleChoice: 'Nhiều lựa chọn',
    TrueFalse: 'Đúng/Sai',
    ShortAnswer: 'Trả lời ngắn',
    Essay: 'Tự luận',
  };

  const buildQuestionPayload = (type, q, examMeta) => {
    const base = {
      questionType: type,
      grade: examMeta?.grade,
      content: q?.question ?? q?.content ?? '',
    };

    if (type === 'MultipleChoice' || type === 'TrueFalse') {
      return {
        ...base,
        answer1: q?.option1 ?? '',
        answer2: q?.option2 ?? '',
        answer3: q?.option3 ?? '',
        answer4: q?.option4 ?? '',
        answer5: q?.option5 ?? '',
        answer6: q?.option6 ?? '',
      };
    }
    return base;
  };

  const persistAutoExamFromAi = async (aiRes, examRes, matrixSections, examMeta) => {
    const examId = examRes?.data?.data?.id;
    if (!examId) throw new Error('Thiếu examId sau khi postExam.');

    // 1) Tạo section theo từng loại có dữ liệu
    const sectionIdsByType = {};

    const ensureSection = async (type) => {
      if (sectionIdsByType[type]) return sectionIdsByType[type];

      const title = SECTION_TITLES[type] || type;
      const displayOrder = DISPLAY_ORDER[type] ?? 99;
      for (const secs of matrixSections) {
        const created = await createSection({
          examId,
          matrixSectionId: secs.id,
          title,
          description: '',
          sectionType: type,
          displayOrder,
        });

        const sid = created?.data?.data?.id ?? created?.data?.id ?? created?.data;
        if (!sid) throw new Error(`Không lấy được sectionId cho type ${type}.`);
        sectionIdsByType[type] = sid;
        return sid;
      }
    };

    // 2) Duyệt từng loại câu hỏi từ AI và lưu
    const groups = {
      MultipleChoice: aiRes?.data?.multiple_choice ?? [],
      TrueFalse: aiRes?.data?.true_false ?? [],
      ShortAnswer: aiRes?.data?.short_answer ?? [],
      Essay: aiRes?.data?.essay ?? [],
    };

    for (const [type, list] of Object.entries(groups)) {
      if (!Array.isArray(list) || list.length === 0) continue;

      const sectionId = await ensureSection(type);

      for (const q of list) {
        const payload = buildQuestionPayload(type, q, examMeta);
        const createdQ = await postQuestion(payload);
        const questionId = createdQ?.data?.data?.id ?? createdQ?.data?.id ?? createdQ?.data;
        if (!questionId) continue;

        await postQuestionSection({ questionId, sectionId });
      }
    }

    return { examId, sectionIdsByType };
  };

  const generateAutoExamDocx = async (
    responseAiData,
    examTitle,
    versionCfg
  ) => {
    const toNumber = (v, def = 1) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : def;
    };
    const normalize = cfg => {
      if (typeof cfg === 'number')
        return {
          versionCount: toNumber(cfg, 1),
          randomizeQuestions: true,
          randomizeOptions: false,
        };
      if (cfg && typeof cfg === 'object')
        return {
          versionCount: toNumber(cfg.versionCount, 1),
          randomizeQuestions: cfg.randomizeQuestions ?? true,
          randomizeOptions: cfg.randomizeOptions ?? false,
        };
      return {
        versionCount: 1,
        randomizeQuestions: true,
        randomizeOptions: false,
      };
    };
    const { versionCount, randomizeQuestions, randomizeOptions } =
      normalize(versionCfg);
    const shuffle = arr => {
      const a = Array.isArray(arr) ? [...arr] : [];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const shuffleOptions = q => {
      let opts = [
        { letter: 'A', text: q?.option1 },
        { letter: 'B', text: q?.option2 },
        { letter: 'C', text: q?.option3 },
        { letter: 'D', text: q?.option4 },
      ].filter(o => `${o.text ?? ''}`.trim() !== '');
      if (randomizeOptions) opts = shuffle(opts);
      const letters = ['A', 'B', 'C', 'D'];
      return opts.map((o, i) => ({ letter: letters[i], text: o.text }));
    };

    const originalMC = responseAiData?.data?.multiple_choice ?? [];
    const originalTF = responseAiData?.data?.true_false ?? [];
    const originalSA = responseAiData?.data?.short_answer ?? [];
    const originalEssay = responseAiData?.data?.essay ?? [];

    for (let ver = 1; ver <= versionCount; ver++) {
      const mc = randomizeQuestions ? shuffle(originalMC) : [...originalMC];
      const tf = randomizeQuestions ? shuffle(originalTF) : [...originalTF];
      const sa = randomizeQuestions ? shuffle(originalSA) : [...originalSA];
      const es = randomizeQuestions
        ? shuffle(originalEssay)
        : [...originalEssay];

      const children = [];

      const header = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6 },
                  bottom: { style: BorderStyle.SINGLE, size: 6 },
                  left: { style: BorderStyle.SINGLE, size: 6 },
                  right: { style: BorderStyle.SINGLE, size: 6 },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'TRƯỜNG THPT', bold: true }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '🙢★🙠' })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6 },
                  bottom: { style: BorderStyle.SINGLE, size: 6 },
                  left: { style: BorderStyle.SINGLE, size: 6 },
                  right: { style: BorderStyle.SINGLE, size: 6 },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: (examTitle || 'ĐỀ THI').toUpperCase(),
                        bold: true,
                        size: 28,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'MÔN: VẬT LÍ - KHỐI: 12',
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Thời gian làm bài: 45 phút',
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Mã đề: ${String(ver).padStart(2, '0')}`,
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
      children.push(header);
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
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

      let mcCount = 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Phần 1. Trắc nghiệm nhiều lựa chọn',
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      mc.forEach((q, i) => {
        mcCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${i + 1}. `, bold: true }),
              new TextRun(q?.question ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
        shuffleOptions(q).forEach(ans => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${ans.letter}. `, bold: true }),
                new TextRun(String(ans.text ?? '')),
              ],
              spacing: { after: 50 },
            })
          );
        });
      });

      let tfCount = 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Phần 2. Trắc nghiệm Đúng/Sai', bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      tf.forEach((q, i) => {
        tfCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${i + 1}. `, bold: true }),
              new TextRun(q?.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
      });

      let saCount = 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Phần 3. Trắc nghiệm trả lời ngắn',
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      sa.forEach((q, i) => {
        saCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${i + 1}. `, bold: true }),
              new TextRun(q?.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
      });

      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Phần II: TỰ LUẬN', bold: true })],
          spacing: { before: 200, after: 100 },
        })
      );
      es.forEach((q, i) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${i + 1}. `, bold: true }),
              new TextRun(q?.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
      });

      const chunk = 10,
        FIRST_COL = 8;
      const addAnswerTable = (title, count) => {
        if (!count) return;
        children.push(
          new Paragraph({
            children: [new TextRun({ text: title, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          })
        );
        for (let start = 1; start <= count; start += chunk) {
          const end = Math.min(start + chunk - 1, count);
          const w = (100 - FIRST_COL) / (end - start + 1);
          const head = [
            new TableCell({
              width: { size: FIRST_COL, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  text: 'Câu',
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ];
          const ans = [
            new TableCell({
              width: { size: FIRST_COL, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  text: 'Đáp án',
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ];
          for (let i = start; i <= end; i++) {
            head.push(
              new TableCell({
                width: { size: w, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    text: `${i}`,
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              })
            );
            ans.push(
              new TableCell({
                width: { size: w, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ text: '', alignment: AlignmentType.CENTER }),
                ],
              })
            );
          }
          children.push(
            new Table({
              rows: [
                new TableRow({ children: head }),
                new TableRow({ children: ans }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6 },
                bottom: { style: BorderStyle.SINGLE, size: 6 },
                left: { style: BorderStyle.SINGLE, size: 6 },
                right: { style: BorderStyle.SINGLE, size: 6 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 6 },
                insideVertical: { style: BorderStyle.SINGLE, size: 6 },
              },
            })
          );
          children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        }
      };
      addAnswerTable('ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN', mcCount);
      addAnswerTable('ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI', tfCount);
      addAnswerTable('ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN', saCount);

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const base = (examTitle || 'DE_THI').toUpperCase().replace(/\s+/g, '_');
      const name = versionCount > 1 ? `${base}_V${ver}.docx` : `${base}.docx`;
      saveAs(blob, name);
    }
    toast.success('Đã tải xuống đề thi Word!');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { matrixId } = autoFormRef.current?.getSelectedMatrixId?.() || {};
    const examData = autoFormRef.current?.getExamData();
    const versionCfg = autoFormRef.current?.getNumberofExamPaper();

    if (!matrixId) return toast.error('Vui lòng chọn ma trận đề.');

    try {
      setLoading(true);
      const resMatrix = await getMatrixById(matrixId);
      const selectedMatrix = resMatrix?.data?.data || {};

      const resExamCat = await getExamByCategoryById(
        selectedMatrix?.examCategoryId
      );

      const resSections = await getMatrixSection({
        matrixId: selectedMatrix.id,
      });
      const secs = resSections?.data?.data?.data || [];
      const finalSections = await Promise.all(
        secs.map(async s => {
          const det = await getMatrixSectionDetail(s.id);
          return {
            ...s,
            sectionDetails: {
              statusCode: det?.data?.statusCode,
              data: det?.data?.data?.map(it => ({
                title: it?.title,
                levelName: it?.levelName,
                typeName: it?.typeName,
                quantity: it?.quantity,
              })),
              message: det?.data?.message,
              errors: det?.data?.errors,
            },
          };
        })
      );

      const sectionStats = finalSections.map(section => {
        const totalQuestions = section?.sectionDetails?.data?.reduce(
          (sum, it) => sum + (it?.quantity || 0),
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
        'Tự luận': 'Phần IV. Tự luận',
      };
      const order = ['Nhiều lựa chọn', 'Đúng/Sai', 'Trả lời ngắn', 'Tự luận'];
      const bullet = order
        .map(name => {
          const s = sectionStats.find(x => x?.title === name);
          return s
            ? `+ ${labelMap[name]}: ${s.totalQuestions} Câu = ${s.score} điểm`
            : null;
        })
        .filter(Boolean);

      const matrixData = {
        examType: resExamCat?.data?.data?.name,
        grade: String(selectedMatrix?.grade || ''),
        description: [
          `- Thời điểm kiểm tra: Kiểm tra ${resExamCat?.data?.data?.name?.toLowerCase?.()}`,
          '- Hình thức kiểm tra: Kết hợp giữa trắc nghiệm và tự luận (70% trắc nghiệm, 30% tự luận).',
          '- Cấu trúc:',
          ...bullet,
        ].join('\n'),
        year: Number(selectedMatrix?.year || 0),
        matrix: {
          sections: finalSections.map(it => ({
            title: it?.title,
            score: it?.levelName,
            sectionDetails: it?.sectionDetails,
          })),
        },
      };

      const aiRes = await generateAutoExam(matrixData);
      if (aiRes?.data) {
        const examRes = await postExam(examData);
        await persistAutoExamFromAi(aiRes, examRes, secs, {
          grade: examData?.grade,
          title: examData?.title,
        });

        // await generateAutoExamDocx(aiRes, examData?.title, versionCfg);
        toast.success('Tạo đề tự động thành công!');
        autoFormRef.current?.resetData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data || 'Lỗi khi tạo đề thi tự động!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='bg-gray-50 min-h-screen'>
      <div className='sticky top-0 z-10 bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition'
              aria-label='Quay lại'
              title='Quay lại'
            >
              <IoArrowBack size={22} className='text-gray-700' />
            </button>

            <div className='text-indigo-500 text-2xl leading-none' aria-hidden>
              <i className='fas fa-robot' />
            </div>

            <h1 className='text-indigo-600 font-bold text-xl sm:text-2xl'>
              Thêm đề thi (Tự động)
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 '>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <AutoExamForm ref={autoFormRef} />

          {/* Submit */}
          <div className='hidden sm:block'>
            <PrimaryButton className='w-full' type='submit' disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo'}
            </PrimaryButton>
          </div>

          {/* Action bar  */}
          <div className='sm:hidden fixed inset-x-0 bottom-0 z-20 bg-white/95 border-t px-4 py-3'>
            <PrimaryButton className='w-full' type='submit' disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateAutoExam;
