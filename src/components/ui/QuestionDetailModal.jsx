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
    0: 'Trắc nghiệm',
    1: 'Đúng/Sai',
    2: 'Trắc nghiệm trả lời ngắn',
    3: 'Tự luận',
  };
  const parseQuestion = content => {
    const answerPattern =
      /[Aa][\.\)]\s*([^\n]+)\s*[Bb][\.\)]\s*([^\n]+)\s*[Cc][\.\)]\s*([^\n]+)\s*[Dd][\.\)]\s*([^\n]+)/;

    const match = content.match(answerPattern);

    if (match) {
      return {
        questionText: content.split(/[Aa][\.\)]/)[0].trim(),
        answers: {
          A: match[1].trim(),
          B: match[2].trim(),
          C: match[3].trim(),
          D: match[4].trim(),
        },
      };
    }

    return {
      questionText: content.trim(),
      answers: null,
    };
  };

  const { questionText, answers } = parseQuestion(editedQuestion.content || '');

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
                {questionText}
              </p>
            )}
          </div>

          {!editMode && answers && (
            <div>
              <p className='font-bold text-gray-800 mb-1'>Đáp án:</p>
              <ul className='space-y-1'>
                <li>
                  <strong>A.</strong> {answers.A}
                </li>
                <li>
                  <strong>B.</strong> {answers.B}
                </li>
                <li>
                  <strong>C.</strong> {answers.C}
                </li>
                <li>
                  <strong>D.</strong> {answers.D}
                </li>
              </ul>
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
                  <option value='MultipleChoice'>Trắc nghiệm</option>
                  <option value='TrueFalse'>Đúng/Sai</option>
                  <option value='ShortAnswer'>Trắc nghiệm trả lời ngắn</option>
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
