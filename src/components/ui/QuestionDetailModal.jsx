import PrimaryButton from '@/components/ui/PrimaryButton';

const QuestionDetailModal = ({ question, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div className='bg-white rounded-lg p-6 w-full max-w-xl shadow-lg'>
        <h2 className='text-lg font-bold mb-4'>Chi tiết câu hỏi</h2>

        <p>
          <strong>Nội dung:</strong> {question.content}
        </p>
        <p>
          <strong>Mức độ:</strong>{' '}
          {question.level === 1
            ? 'Dễ'
            : question.level === 2
            ? 'Trung bình'
            : question.level === 3
            ? 'Khó'
            : 'Không rõ'}
        </p>
        <p>
          <strong>Loại:</strong>{' '}
          {question.type === 1
            ? 'Trắc nghiệm'
            : question.type === 2
            ? 'Tự luận'
            : 'Không rõ'}
        </p>

        <div className='text-right mt-4'>
          <PrimaryButton
            onClick={onClose}
            className='px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600'
          >
            Đóng
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailModal;
