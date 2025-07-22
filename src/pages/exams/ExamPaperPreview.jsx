import { useEffect, useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionSelectionModal from './QuestionSelectionModal';

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
      return sectionType;
  }
};

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

  const sortedSections = [...sectionsCreated].sort(
    (a, b) => a?.data?.displayOrder - b?.data?.displayOrder
  );

  if (!examData) {
    return (
      <div className='text-center text-gray-500'>
        Không có dữ liệu đề thi để hiển thị.
      </div>
    );
  }

  const groupedSections = sortedSections.reduce((acc, section) => {
    const groupKey = section?.data?.title;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: section?.data?.title,
        displayOrder: section?.data?.displayOrder,
        details: [],
      };
    }
    acc[groupKey].details.push(section);
    return acc;
  }, {});
  const orderedGroupedSections = Object.values(groupedSections).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleOpenQuestionModal = (
    sectionId,
    sectionType,
    levelName,
    quantityLimit
  ) => {
    setCurrentSectionToSelect({
      id: sectionId,
      type: handleSectionType(sectionType),
      level: levelName,
    });
    setCurrentQuantityLimit(quantityLimit);
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setCurrentSectionToSelect(null);
    setCurrentQuantityLimit(0);
  };

  const handleSaveSelectedQuestions = (sectionId, questions) => {
    onQuestionsSelected(sectionId, questions);
    handleCloseQuestionModal();
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md space-y-6'>
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
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Nhập tên Sở GDĐT'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              TRƯỜNG THPT
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Nhập tên Trường THPT'
            />
          </div>
        </div>

        {/* Khung bên phải */}
        <div className='col-span-1 pl-4 space-y-2'>
          <p className='text-md font-bold text-gray-800'>
            {examData?.title || 'Tiêu đề đề thi'}
          </p>
          <p className='text-md text-gray-700'>
            Môn: Vật lí - Khối: {examData?.grade || '__'}
          </p>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Thời gian làm bài
            </label>
            <input
              type='text'
              className='w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1'
              placeholder='Ví dụ: 45 phút'
            />
          </div>
          <p className='text-md text-gray-700'>
            Mã đề:{' '}
            {examData?.id
              ? examData?.id.substring(0, 6).toUpperCase()
              : '______'}
          </p>
        </div>
      </div>

      <hr className='my-4' />

      <h3 className='text-xl font-bold text-indigo-700 text-center mb-4'>
        Cấu trúc đề thi
      </h3>

      {orderedGroupedSections.map(group => (
        <div
          key={group.title}
          className='border border-gray-200 p-4 rounded-md mt-4'
        >
          <h4 className='text-lg font-semibold text-gray-800 mb-3'>
            {group.title}
          </h4>
          {group.details.map(s => {
            const correspondingMatrixDetail = matrixSectionDetail.find(
              detail =>
                detail?.typeName === s?.data?.sectionType &&
                detail?.levelName === s?.levelName
            );

            const quantity = correspondingMatrixDetail
              ? correspondingMatrixDetail?.quantity
              : 'N/A';
            const currentSelectedCount =
              selectedQuestionsBySection[s?.data?.id]?.length || 0;

            return (
              <div
                key={s?.data?.id}
                className='ml-4 border-l-2 border-indigo-300 pl-4 py-2 my-2 bg-gray-50 rounded-md'
              >
                <p className='font-medium text-gray-700 mb-1'>
                  Mức độ: {s?.levelName}
                </p>
                <p className='text-gray-600 mb-2'>
                  Số lượng câu hỏi: {quantity}
                </p>
                <div className='flex items-center justify-between p-2 bg-white border border-dashed border-gray-200 rounded-md'>
                  <span className='text-gray-700'>
                    Đã chọn: {currentSelectedCount} / {quantity} câu hỏi.
                  </span>
                  <PrimaryButton
                    className='bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3'
                    onClick={() =>
                      handleOpenQuestionModal(
                        s?.data?.id,
                        s?.data?.sectionType,
                        s?.levelName,
                        quantity
                      )
                    }
                  >
                    Chọn câu hỏi
                  </PrimaryButton>
                </div>
                <ul className='mt-2'>
                  {selectedQuestionsBySection[s?.data?.id]?.map(
                    (q, index, array) => (
                      <li
                        key={q?.id}
                        className={`text-gray-700 text-sm flex items-start ${
                          index < array.length - 1
                            ? 'border-b border-gray-200 pb-2 mb-2'
                            : ''
                        }`}
                      >
                        <span className='font-semibold mr-2 flex-shrink-0'>
                          {q?.no}.
                        </span>
                        <span style={{ whiteSpace: 'normal' }}>
                          {q?.content}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      ))}

      <div className='flex justify-between mt-6'>
        <PrimaryButton
          className='bg-gray-500 hover:bg-gray-600 text-white'
          onClick={onBack}
        >
          Quay lại
        </PrimaryButton>
        <PrimaryButton
          className='bg-green-500 hover:bg-green-600 text-white'
          onClick={() => alert('Tải xuống đề thi')}
        >
          Tải xuống
        </PrimaryButton>
      </div>
      {isQuestionModalOpen && currentSectionToSelect && (
        <QuestionSelectionModal
          sectionId={currentSectionToSelect?.id}
          sectionType={currentSectionToSelect?.type}
          levelName={currentSectionToSelect?.level}
          quantityLimit={currentQuantityLimit}
          initialSelectedQuestions={
            selectedQuestionsBySection[currentSectionToSelect.id] || []
          }
          onClose={handleCloseQuestionModal}
          onSave={handleSaveSelectedQuestions}
        />
      )}
    </div>
  );
};

export default ExamPaperPreview;
