import { FiX } from 'react-icons/fi';

const QuestionDetailPopup = ({ question, onClose }) => {
  if (!question) return null;

  return (
    <div
      className='fixed inset-0 backdrop-blur-xs bg-opacity-30 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-white/80 backdrop-blur-sm p-6 rounded-lg w-[500px] shadow-xl relative'
        onClick={e => e.stopPropagation()}
      >
        <h2 className='text-xl font-bold mb-4'>Chi tiết câu hỏi</h2>
        <p className='mb-2'>
          <strong>Mức độ:</strong> {question.level}
        </p>
        <p className='mb-2'>
          <strong>Câu hỏi:</strong> {question.question}
        </p>
        <div className='space-y-1 mt-4'>
          {Object.entries(question.options).map(([key, value]) => (
            <p key={key}>
              <strong>{key}.</strong> {value}
            </p>
          ))}
        </div>

        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-600 text-xl cursor-pointer'
          aria-label='Đóng'
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default QuestionDetailPopup;
