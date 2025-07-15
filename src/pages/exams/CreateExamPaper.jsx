import { useState, useRef } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualExamForm from './ManualExamForm';
import { postExam } from '@/services/examService';
import { getMatrixSection, getMatrixSectionDetail } from '@/services/matrixService';
import { createSection } from '@/services/sectionService';
import ExamPaperPreview from './ExamPaperPreview';
import { toast } from 'react-toastify';

const CreateExamPaper = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const manualFormRef = useRef(null);
  const [examCreatedData, setExamCreatedData] = useState(null);
  const [matrixSectionDetail, setmatrixSectionDetail] = useState(null);
  const [sectionsCreated, setSectionsCreated] = useState(null);
  const [selectedQuestionsBySection, setSelectedQuestionsBySection] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'manual') {
      const formData = manualFormRef.current?.getFormData();
      const selectedMatrixId = manualFormRef.current?.getSelectedMatrixId();

      if (formData && selectedMatrixId) {
        try {
          const responseData = await postExam(formData);
          const examId = responseData.data.data.id;
          const responseMatrixSection = await getMatrixSection(selectedMatrixId);
          const matrixSections = responseMatrixSection.data.data;
          const collectedMatrixSectionDetails = [];
          const sectionPromises = matrixSections.map(async (ms) => {
            const responseMatrixSectionDetail = await getMatrixSectionDetail(ms.id);
            const matrixSectionDetailData = responseMatrixSectionDetail.data.data;

            if (!matrixSectionDetailData || matrixSectionDetailData.length === 0) {
              console.warn(`Không tìm thấy chi tiết cho ID phần ma trận: ${ms.id}`);
              return [];
            }

            const createdSectionsForThisMatrixSection = await Promise.all(
              matrixSectionDetailData.map(async (detailData) => {
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
                }
              })
            );
            return createdSectionsForThisMatrixSection;
          });

          const allCreatedSections = (await Promise.all(sectionPromises)).flat();


          setExamCreatedData(responseData.data.data);
          setmatrixSectionDetail(collectedMatrixSectionDetails);
          setSectionsCreated(allCreatedSections);
          toast.success('Tạo đề thi thành công!');
        } catch (error) {
          console.error('Lỗi khi gọi API postExam:', error);
          toast.error('Có lỗi xảy ra khi tạo đề thi. Vui lòng thử lại.');
        }
      } else {
        if (!formData) {
          toast.error('Vui lòng điền đầy đủ thông tin đề thi.');
        } else if (!selectedMatrixId) {
          toast.error('Vui lòng chọn một ma trận đề.');
        } else {
          toast.error('Có lỗi khi lấy dữ liệu form. Vui lòng thử lại.');
        }
        console.log('Không thể lấy dữ liệu form thủ công hoặc chưa chọn ma trận.');
      }
    } else {
      console.log('Submit form tự động');
      toast.warning('Chức năng tạo đề tự động chưa được triển khai.');
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
                <ul className='flex flex-wrap -mb-px text-sm font-medium text-center' role='tablist'>
                  <li className='mr-2' role='presentation'>
                    <button
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'manual'
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
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'automatic'
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
                {activeTab === 'manual' && <ManualExamForm ref={manualFormRef} />}
                {activeTab === 'automatic' && (
                  <div className='py-8 text-center text-gray-500'>
                    Chức năng tạo đề tự động sẽ được phát triển sau.
                  </div>
                )}
                <PrimaryButton
                  className='w-full'
                  type='submit'
                >
                  Tạo
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
