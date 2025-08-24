import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ExamPaperPreview from '@/pages/exams/ExamPaperPreview';
import { toast } from 'react-toastify';
import { postExam } from '@/services/examService';
import {
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import { createSection } from '@/services/sectionService';
import { IoArrowBack } from 'react-icons/io5';
import ManualExamForm from '@/pages/admin/exams/ManualExamForm';

const CreateManualExam = () => {
  const manualFormRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [examCreatedData, setExamCreatedData] = useState(null);
  const [matrixSectionDetail, setMatrixSectionDetail] = useState(null);
  const [sectionsCreated, setSectionsCreated] = useState(null);
  const [selectedQuestionsBySection, setSelectedQuestionsBySection] = useState(
    {}
  );
  const navigate = useNavigate();

  const handleBack = () => {
    setExamCreatedData(null);
    setMatrixSectionDetail(null);
    setSectionsCreated(null);
    setSelectedQuestionsBySection({});
  };

  const onQuestionsSelected = (sectionId, qs) => {
    setSelectedQuestionsBySection(prev => ({ ...prev, [sectionId]: qs }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = manualFormRef.current?.getFormData();
    const { matrixId } = manualFormRef.current?.getSelectedMatrixId?.() || {};

    if (!formData) return toast.error('Vui lòng điền đầy đủ thông tin.');
    if (!matrixId) return toast.error('Vui lòng chọn một ma trận đề.');

    try {
      setLoading(true);

      // Tạo đề nháp
      const createdExamRes = await postExam(formData);
      const examId = createdExamRes?.data?.data?.id;

      // Lấy danh sách section theo ma trận
      const resSections = await getMatrixSection({
        matrixId: matrixId,
      });
      const matrixSections = resSections?.data?.data?.data || [];

      const collectedMatrixSectionDetails = [];
      const createdSections = (
        await Promise.all(
          matrixSections.map(async ms => {
            const resDetail = await getMatrixSectionDetail(ms.id);
            const details = resDetail?.data?.data || [];
            if (!details.length) return [];

            const list = await Promise.all(
              details.map(async d => {
                collectedMatrixSectionDetails.push(d);
                let displayOrder = 0;
                if (d.typeName === 'MultipleChoice') displayOrder = 1;
                else if (d.typeName === 'TrueFalse') displayOrder = 2;
                else if (d.typeName === 'ShortAnswer') displayOrder = 3;
                else if (d.typeName === 'Essay') displayOrder = 4;

                const created = await createSection({
                  examId,
                  title: d.title,
                  matrixSectionId: ms.id,
                  description: d.description,
                  sectionType: d.typeName,
                  displayOrder,
                });
                return { ...created.data, levelName: d.levelName };
              })
            );

            return list;
          })
        )
      ).flat();

      setExamCreatedData(createdExamRes?.data?.data);
      setMatrixSectionDetail(collectedMatrixSectionDetails);
      setSectionsCreated(createdSections);
      toast.success(
        'Tạo đề thi (nháp) thành công! Vui lòng chọn câu hỏi theo ma trận và tải xuống.'
      );
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tạo đề.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='bg-gray-50 min-h-screen'>
      {/* Header */}
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
              <i className='fas fa-graduation-cap' />
            </div>

            <h1 className='text-indigo-600 font-bold text-xl sm:text-2xl'>
              {examCreatedData ? 'Xem trước đề thi' : 'Thêm đề thi (Thủ công)'}
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6'>
        {examCreatedData ? (
          <ExamPaperPreview
            examData={examCreatedData}
            matrixSectionDetail={matrixSectionDetail}
            sectionsCreated={sectionsCreated}
            onBack={handleBack}
            selectedQuestionsBySection={selectedQuestionsBySection}
            onQuestionsSelected={onQuestionsSelected}
          />
        ) : (
          <form className='space-y-6' onSubmit={handleSubmit}>
            <ManualExamForm ref={manualFormRef} />

            <div className='hidden sm:block'>
              <PrimaryButton
                className='w-full'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo'}
              </PrimaryButton>
            </div>

            <div className='sm:hidden fixed inset-x-0 bottom-0 z-20 bg-white/95 border-t px-4 py-3'>
              <PrimaryButton
                className='w-full'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default CreateManualExam;
