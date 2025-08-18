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

  const generateAutoExamDocx = (responseAiData, examTitle) => {
    try {
      const children = [];

      // HEADER TABLE
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
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
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
                      new TextRun({ text: 'Mã đề: ______', bold: true }),
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

      // STUDENT INFO
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

      // grab arrays safely
      const mcList = responseAiData?.data?.multiple_choice ?? [];
      const tfList = responseAiData?.data?.true_false ?? [];
      const saList = responseAiData?.data?.short_answer ?? [];
      const essayList = responseAiData?.data?.essay ?? [];

      // PART I: Multiple Choice
      let mcCount = 0;
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

      mcList.forEach((q, idx) => {
        mcCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}. `, bold: true }),
              new TextRun(q.question ?? ''),
            ],
            spacing: { after: 50 },
          })
        );

        const answers = [
          { letter: 'A', text: q.option1 },
          { letter: 'B', text: q.option2 },
          { letter: 'C', text: q.option3 },
          { letter: 'D', text: q.option4 },
        ];

        answers.forEach(ans => {
          if (ans.text !== undefined && ans.text !== null) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${ans.letter}. `, bold: true }),
                  new TextRun(`${ans.text}`),
                ],
                spacing: { after: 50 },
              })
            );
          }
        });
      });

      //PART 2: True/False
      let tfCount = 0;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Phần 2. Trắc nghiệm Đúng/Sai', bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      tfList.forEach((q, idx) => {
        tfCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}. `, bold: true }),
              new TextRun(q.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );

        const answers = [
          { letter: 'A', text: q.option1 },
          { letter: 'B', text: q.option2 },
          { letter: 'C', text: q.option3 },
          { letter: 'D', text: q.option4 },
        ];
        answers.forEach(ans => {
          if (ans.text !== undefined && ans.text !== null) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${ans.letter}. `, bold: true }),
                  new TextRun(`${ans.text}`),
                ],
                spacing: { after: 50 },
              })
            );
          }
        });
      });

      //PART 3: Short Answer
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

      saList.forEach((q, idx) => {
        saCount++;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}. `, bold: true }),
              new TextRun(q.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
        // imagePrompt được bỏ qua ở đây (nếu cần chèn ảnh phải fetch/generate thêm)
      });

      // PART II: Essay
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Phần II: TỰ LUẬN', bold: true })],
          spacing: { before: 200, after: 100 },
        })
      );

      essayList.forEach((q, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}. `, bold: true }),
              new TextRun(q.content ?? ''),
            ],
            spacing: { after: 50 },
          })
        );
      });

      // ANSWER TABLE: Multiple Choice
      if (mcCount > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'ĐÁP ÁN PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          })
        );

        const mcRows = [];
        const mcHeaderCells = [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Câu',
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];
        const mcAnswerCells = [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Đáp án',
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];

        for (let i = 1; i <= mcCount; i++) {
          mcHeaderCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: `${i}`,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
          mcAnswerCells.push(
            new TableCell({
              children: [
                new Paragraph({ text: '', alignment: AlignmentType.CENTER }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        }

        mcRows.push(new TableRow({ children: mcHeaderCells }));
        mcRows.push(new TableRow({ children: mcAnswerCells }));

        children.push(
          new Table({
            rows: mcRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
            },
          })
        );
      }

      // ANSWER TABLE: True/False
      if (tfCount > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'ĐÁP ÁN PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          })
        );

        const tfAnswerRows = [];
        const tfHeaderCells = [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Câu',
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ];

        for (let i = 1; i <= tfCount; i++) {
          tfHeaderCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: `Câu ${i}`,
                  bold: true,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        }

        tfAnswerRows.push(new TableRow({ children: tfHeaderCells }));

        const tfAnswerOptions = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'];
        for (let i = 0; i < tfAnswerOptions.length; i++) {
          const rowCells = [
            new TableCell({
              children: [
                new Paragraph({
                  text: i === 0 ? 'Đáp án' : '',
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ];

          for (let j = 0; j < tfCount; j++) {
            rowCells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    text: tfAnswerOptions[i],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
                verticalAlign: VerticalAlign.CENTER,
              })
            );
          }

          tfAnswerRows.push(new TableRow({ children: rowCells }));
        }

        children.push(
          new Table({
            rows: tfAnswerRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
            },
          })
        );
      }

      // ANSWER TABLE: Short Answer
      if (saCount > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'ĐÁP ÁN PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
          })
        );

        const saRows = [];
        const saHeaderCells = [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Câu',
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];
        const saAnswerCells = [
          new TableCell({
            children: [
              new Paragraph({
                text: 'Đáp án',
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ];

        for (let i = 1; i <= saCount; i++) {
          saHeaderCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: `${i}`,
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
          saAnswerCells.push(
            new TableCell({
              children: [
                new Paragraph({ text: '', alignment: AlignmentType.CENTER }),
              ],
              verticalAlign: VerticalAlign.CENTER,
            })
          );
        }

        saRows.push(new TableRow({ children: saHeaderCells }));
        saRows.push(new TableRow({ children: saAnswerCells }));

        children.push(
          new Table({
            rows: saRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              left: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'auto' },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 6,
                color: 'auto',
              },
            },
          })
        );
      }

      // PACK & SAVE
      const doc = new Document({ sections: [{ children }] });
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${(examTitle || 'DE_THI').toUpperCase()}.docx`);
        toast.success('Đề thi Word đã được tải xuống!');
      });
    } catch (error) {
      console.error('Lỗi xuất file Word AI:', error);
      toast.error('Không thể tải xuống đề thi AI.');
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
      const numberOfExam = autoFormRef.current?.getNumberofExamPaper();
      const examTitle = autoFormRef.current?.getExamTitle();

      if (selectedMatrixId) {
        try {
          const responseMatrix = await getMatrixById(selectedMatrixId.matrixId);
          const matrixPage = responseMatrix?.data?.data || {};
          const list = Array.isArray(matrixPage.data) ? matrixPage.data : [];
          const selectedMatrix =
            list.find(item => item.id === selectedMatrixId.matrixId) || null;
          const responseExamCategory = await getExamByCategoryById(
            selectedMatrix.examCategoryId
          );

          let matrixData = {};

          if (selectedMatrix) {
            setLoading(true);
            const responseSections = await getMatrixSection(selectedMatrix.id);
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

              matrixData = {
                examType: responseExamCategory?.data?.data?.name,
                grade: selectedMatrix.grade.toString(),
                description: selectedMatrix.description,
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

            generateAutoExamDocx(responseAiData, examTitle.title);
            toast.success('Tạo đề thành công!');
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
