import { FiX } from 'react-icons/fi';

const QuestionDetailPopup = ({ question, onClose }) => {
  if (!question) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-white/90 p-6 rounded-lg w-[500px] shadow-xl relative text-left'
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-600 hover:text-black text-xl'
          aria-label='Đóng'
        >
          <FiX />
        </button>

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
      </div>
    </div>
  );
};

export default QuestionDetailPopup;
