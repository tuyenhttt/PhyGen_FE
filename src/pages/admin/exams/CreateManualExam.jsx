import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualExamForm from '@/pages/exams/ManualExamForm';
import ExamPaperPreview from '@/pages/exams/ExamPaperPreview';
import { toast } from 'react-toastify';
import {
    postExam,
} from '@/services/examService';
import {
    getMatrixSection,
    getMatrixSectionDetail,
} from '@/services/matrixService';
import { createSection } from '@/services/sectionService';
import { IoArrowBack } from 'react-icons/io5';

const CreateManualExam = () => {
    const manualFormRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [examCreatedData, setExamCreatedData] = useState(null);
    const [matrixSectionDetail, setMatrixSectionDetail] = useState(null);
    const [sectionsCreated, setSectionsCreated] = useState(null);
    const [selectedQuestionsBySection, setSelectedQuestionsBySection] = useState({});
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = manualFormRef.current?.getFormData();
        const selectedMatrixId = manualFormRef.current?.getSelectedMatrixId();

        if (!formData) return toast.error('Vui lòng điền đầy đủ thông tin.');
        if (!selectedMatrixId) return toast.error('Vui lòng chọn một ma trận đề.');

        try {
            setLoading(true);
            const createdExamRes = await postExam(formData);
            const examId = createdExamRes?.data?.data?.id;

            const resSections = await getMatrixSection(selectedMatrixId);
            const matrixSections = resSections?.data?.data?.data || [];

            const collectedMatrixSectionDetails = [];
            const createdSections = (await Promise.all(
                matrixSections.map(async (ms) => {
                    const resDetail = await getMatrixSectionDetail(ms.id);
                    const details = resDetail?.data?.data || [];
                    if (!details.length) return [];

                    const list = await Promise.all(details.map(async (d) => {
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
                    }));

                    return list;
                })
            )).flat();

            setExamCreatedData(createdExamRes?.data?.data);
            setMatrixSectionDetail(collectedMatrixSectionDetails);
            setSectionsCreated(createdSections);
            toast.success('Tạo đề thi (nháp) thành công! Vui lòng chọn câu hỏi theo ma trận và tải xuống.');
        } catch (err) {
            console.error(err);
            toast.error('Có lỗi xảy ra khi tạo đề.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20">
            <button
                onClick={() => navigate(-1)}
                className='text-gray-800 flex items-center gap-1 cursor-pointer'
                title='Quay lại'
            >
                <IoArrowBack size={24} className='text-gray-700' />
            </button>
            <div className="max-w-3xl mx-auto px-6 sm:px-12">
                <div className="text-center max-w-md mx-auto mb-4">
                    <div className="text-blue-400 mb-3 text-4xl leading-none">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h2 className="text-indigo-600 font-bold text-3xl mb-1">
                        {examCreatedData ? 'Xem trước đề thi' : 'Thêm đề thi (Thủ công)'}
                    </h2>
                </div>

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
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <ManualExamForm ref={manualFormRef} />
                        <PrimaryButton className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo'}
                        </PrimaryButton>
                    </form>
                )}
            </div>
        </section>
    );
};

export default CreateManualExam;
