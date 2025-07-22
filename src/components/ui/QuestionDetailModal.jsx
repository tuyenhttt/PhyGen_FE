import { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { updateQuestion } from '@/services/questionService';
import { toast } from 'react-toastify';

const QuestionDetailModal = ({ question, editMode, onClose }) => {
  const [editedQuestion, setEditedQuestion] = useState({ ...question });

  const levelMap = {
    NhậnBiết: 0,
    ThôngHiểu: 1,
    VậnDụng: 2,
  };

  const typeMap = {
    MultipleChoice: 0,
    TrueFalse: 1,
    ShortAnswer: 2,
    Essay: 3,
  };

  const levelDisplayMap = {
    0: 'Nhận biết',
    1: 'Thông hiểu',
    2: 'Vận dụng',
  };

  const typeDisplayMap = {
    0: 'Trắc nghiệm nhiều đáp án',
    1: 'Trắc nghiệm Đúng/Sai',
    2: 'Câu hỏi trả lời ngắn',
    3: 'Tự luận',
  };

  const imageList = Array.isArray(editedQuestion.image)
    ? editedQuestion.image
    : (editedQuestion.image || '')
        .split(/[;,]/)
        .map(url => url.trim())
        .filter(Boolean);

  const handleChange = (field, value) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        id: editedQuestion.id,
        topicId: editedQuestion.topicId,
        content: editedQuestion.content,
        level: levelMap[editedQuestion.levelName],
        type: typeMap[editedQuestion.typeName],
        image: editedQuestion.image || '',
        answer1: editedQuestion.answer1 || null,
        answer2: editedQuestion.answer2 || null,
        answer3: editedQuestion.answer3 || null,
        answer4: editedQuestion.answer4 || null,
        answer5: editedQuestion.answer5 || null,
        answer6: editedQuestion.answer6 || null,
        correctAnswer: editedQuestion.correctAnswer || null,
      };

      await updateQuestion(payload);
      toast.success('Cập nhật thành công');
      onClose();
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      toast.error('Lỗi cập nhật!');
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div className='bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold text-gray-800 pb-3'>
          {editMode ? 'Chỉnh sửa câu hỏi' : 'Chi tiết câu hỏi'}
        </h2>

        <div className='space-y-4 text-gray-700'>
          <div>
            <p className='font-bold text-gray-800 mb-1'>Nội dung:</p>
            {editMode ? (
              <textarea
                className='w-full border rounded p-2'
                rows={6}
                value={editedQuestion.content}
                onChange={e => handleChange('content', e.target.value)}
              />
            ) : (
              <p className='whitespace-pre-line leading-relaxed'>
                {editedQuestion.content}
              </p>
            )}
          </div>

          {!editMode && (
            <div>
              <p className='font-bold text-gray-800 mb-1'>Đáp án:</p>
              <ul className='space-y-1'>
                {[1, 2, 3, 4, 5, 6].map(index => {
                  const answer = editedQuestion[`answer${index}`];
                  if (!answer) return null;

                  const label = String.fromCharCode(64 + index);
                  return (
                    <li key={index}>
                      <strong>{label}.</strong> {answer}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {editMode && (
            <div>
              <p className='font-bold text-gray-800 mb-1'>Đáp án:</p>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <input
                  key={i}
                  type='text'
                  className='w-full border rounded p-2 mb-2'
                  placeholder={`Đáp án ${i}`}
                  value={editedQuestion[`answer${i}`] || ''}
                  onChange={e => handleChange(`answer${i}`, e.target.value)}
                />
              ))}
            </div>
          )}

          {editMode && (
            <div>
              <p className='font-bold text-gray-800 mb-1'>URL hình ảnh:</p>
              <textarea
                rows={2}
                className='w-full border rounded p-2'
                placeholder='Nhập URL ảnh, phân cách bằng dấu phẩy hoặc chấm phẩy'
                value={editedQuestion.image || ''}
                onChange={e => handleChange('image', e.target.value)}
              />
            </div>
          )}

          <div className='flex flex-col sm:flex-row sm:gap-10 text-sm pt-2'>
            <div className='w-full sm:w-1/2'>
              <p className='font-bold text-gray-800'>Mức độ:</p>
              {editMode ? (
                <select
                  value={editedQuestion.levelName}
                  onChange={e => handleChange('levelName', e.target.value)}
                  className='w-full border rounded p-2'
                >
                  <option value='NhậnBiết'>Nhận biết</option>
                  <option value='ThôngHiểu'>Thông hiểu</option>
                  <option value='VậnDụng'>Vận dụng</option>
                </select>
              ) : (
                <p>{levelDisplayMap[levelMap[question.levelName]] || '—'}</p>
              )}
            </div>
            <div className='w-full sm:w-1/2'>
              <p className='font-bold text-gray-800'>Loại:</p>
              {editMode ? (
                <select
                  value={editedQuestion.typeName}
                  onChange={e => handleChange('typeName', e.target.value)}
                  className='w-full border rounded p-2'
                >
                  <option value='MultipleChoice'>
                    Trắc nghiệm nhiều đáp án
                  </option>
                  <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
                  <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
                  <option value='Essay'>Tự luận</option>
                </select>
              ) : (
                <p>{typeDisplayMap[typeMap[question.typeName]] || '—'}</p>
              )}
            </div>
          </div>

          {/* Hình ảnh minh hoạ */}
          <div>
            <p className='font-bold text-gray-800 mb-1'>Hình ảnh minh hoạ:</p>
            {imageList.length > 0 ? (
              <div className='mt-2 flex flex-wrap gap-3'>
                {imageList.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Ảnh ${idx + 1}`}
                    className='max-h-40 rounded border'
                  />
                ))}
              </div>
            ) : (
              <p className='text-gray-500 italic mt-1'>
                Không có hình ảnh minh hoạ.
              </p>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-4'>
          {editMode && (
            <PrimaryButton
              onClick={handleSave}
              className='bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg'
            >
              Lưu
            </PrimaryButton>
          )}
          <PrimaryButton
            onClick={onClose}
            className='bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg'
          >
            Đóng
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailModal;
