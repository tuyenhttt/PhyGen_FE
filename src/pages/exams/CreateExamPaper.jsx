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
  HeadingLevel,
  AlignmentType,
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
    const createParagraph = (text, headingLevel = null, bold = false) => {
      const runs = [new TextRun({ text, bold })];
      return new Paragraph({
        children: runs,
        heading: headingLevel,
        spacing: {
          after: 100,
        },
        alignment: AlignmentType.JUSTIFIED,
      });
    };

    const createQuestionParagraph = (question, options, questionNumber) => {
      const questionParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Câu ${questionNumber}. ${question}`,
            bold: true,
          }),
        ],
      });

      const optionParagraphs = options.map(
        option =>
          new Paragraph({
            children: [
              new TextRun({
                text: `    ${option}`,
              }),
            ],
          })
      );

      return [questionParagraph, ...optionParagraphs];
    };

    const docSections = [];

    docSections.push(
      createParagraph('SỞ GIÁO DỤC VÀ ĐÀO TẠO', HeadingLevel.HEADING_3),
      createParagraph('TRƯỜNG THPT', HeadingLevel.HEADING_3),
      createParagraph('MÔN: VẬT LÍ - KHỐI: 12', HeadingLevel.HEADING_2),
      createParagraph('Thời gian làm bài: 45 phút', null, true),
      createParagraph('Mã đề: 1338A7', null, true),
      createParagraph(
        'Họ và tên thí sinh: ........................................................................',
        null,
        false
      ),
      createParagraph('Lớp: .............', null, false)
    );

    //Câu hỏi nhiều đáp án
    docSections.push(
      createParagraph('I. TRẮC NGHIỆM KHÁCH QUAN', HeadingLevel.HEADING_1),
      createParagraph(
        'Phần 1. Trắc nghiệm nhiều lựa chọn',
        HeadingLevel.HEADING_2
      )
    );
    responseAiData.data.multiple_choice.forEach((q, index) => {
      const questionText = q.question;
      const options = [
        `A.  ${q.option1}.`,
        `B.  ${q.option2}.`,
        `C.  ${q.option3}.`,
        `D.  ${q.option4}.`,
      ];
      docSections.push(
        ...createQuestionParagraph(questionText, options, index + 1)
      );
    });

    // Câu hỏi đúng/sai
    docSections.push(
      createParagraph('Phần 2. Trắc nghiệm Đúng/Sai', HeadingLevel.HEADING_2)
    );
    responseAiData.data.true_false.forEach((q, index) => {
      const questionText = q.content;
      const options = [
        `A.  ${q.option1}`,
        `B.  ${q.option2}`,
        `C.  ${q.option3}`,
        `D.  ${q.option4}`,
      ];
      docSections.push(
        ...createQuestionParagraph(questionText, options, index + 1)
      );
    });

    // Câu trả lời ngắn
    docSections.push(
      createParagraph(
        'Phần 3. Trắc nghiệm trả lời ngắn',
        HeadingLevel.HEADING_2
      )
    );
    responseAiData.data.short_answer.forEach((q, index) => {
      docSections.push(
        createParagraph(`Câu ${index + 1}.  ${q.content}`, null, true)
      );
    });

    // Tự luận
    docSections.push(createParagraph('II. TỰ LUẬN', HeadingLevel.HEADING_1));
    responseAiData.data.essay.forEach((q, index) => {
      docSections.push(
        createParagraph(`Câu ${index + 1}.  ${q.content}`, null, true)
      );
    });

    // tạo file
    const doc = new Document({
      sections: [
        {
          children: docSections,
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${examTitle}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'manual'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'automatic'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
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
