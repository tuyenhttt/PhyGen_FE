import { useState, useEffect } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { postQuestion } from '@/services/questionService';
import { getTopic } from '@/services/topicService';
import { toast } from 'react-toastify';

const AddQuestionModel = ({ onClose }) => {
  const [question, setQuestion] = useState({
    topicId: '',
    content: '',
    levelName: 'NhậnBiết',
    typeName: 'MultipleChoice',
    image: '',
    answer1: '',
    answer2: '',
    answer3: '',
    answer4: '',
    answer5: '',
    answer6: '',
    correctAnswer: '',
  });

  const [topics, setTopics] = useState([]);
  const levelMap = { NhậnBiết: 0, ThôngHiểu: 1, VậnDụng: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await getTopic();
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setTopics(list);
      } catch (err) {
        console.error('Lỗi khi lấy chủ đề:', err);
        toast.error('Không thể tải danh sách chủ đề');
      }
    };
    fetchTopics();
  }, []);

  const handleChange = (field, value) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      topicId: question.topicId,
      content: question.content,
      level: levelMap[question.levelName],
      type: typeMap[question.typeName],
      image: question.image,
      answer1: question.answer1 || null,
      answer2: question.answer2 || null,
      answer3: question.answer3 || null,
      answer4: question.answer4 || null,
      answer5: question.answer5 || null,
      answer6: question.answer6 || null,
      correctAnswer: question.correctAnswer || null,
    };

    try {
      await postQuestion(payload);
      toast.success('Thêm câu hỏi thành công');
      onClose();
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      toast.error('Lỗi thêm câu hỏi!');
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div className='bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold text-gray-800 pb-3'>
          Thêm câu hỏi mới
        </h2>

        <div className='space-y-4 text-gray-700'>
          {/* Chủ đề */}
          <div>
            <p className='font-bold mb-1'>Chủ đề:</p>
            <select
              value={question.topicId}
              onChange={e => handleChange('topicId', e.target.value)}
              className='w-full border rounded p-2'
            >
              <option value='' disabled>
                Chọn chủ đề
              </option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nội dung */}
          <div>
            <p className='font-bold mb-1'>Nội dung:</p>
            <textarea
              rows={6}
              className='w-full border rounded p-2'
              value={question.content}
              onChange={e => handleChange('content', e.target.value)}
            />
          </div>

          {/* Đáp án */}
          <div>
            <p className='font-bold mb-1'>Đáp án:</p>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <input
                  key={i}
                  type='text'
                  className='w-full border rounded p-2'
                  placeholder={`Đáp án ${i}`}
                  value={question[`answer${i}`] || ''}
                  onChange={e => handleChange(`answer${i}`, e.target.value)}
                />
              ))}
            </div>
          </div>

          {/* URL hình ảnh */}
          <div>
            <p className='font-bold mb-1'>URL hình ảnh:</p>
            <textarea
              rows={2}
              className='w-full border rounded p-2'
              placeholder='Nhập URL ảnh, phân cách bằng dấu phẩy hoặc chấm phẩy'
              value={question.image}
              onChange={e => handleChange('image', e.target.value)}
            />
          </div>

          {/* Mức độ & Loại */}
          <div className='flex flex-col sm:flex-row gap-6'>
            <div className='w-full sm:w-1/2'>
              <p className='font-bold mb-1'>Mức độ:</p>
              <select
                value={question.levelName}
                onChange={e => handleChange('levelName', e.target.value)}
                className='w-full border rounded p-2'
              >
                <option value='NhậnBiết'>Nhận biết</option>
                <option value='ThôngHiểu'>Thông hiểu</option>
                <option value='VậnDụng'>Vận dụng</option>
              </select>
            </div>
            <div className='w-full sm:w-1/2'>
              <p className='font-bold mb-1'>Loại:</p>
              <select
                value={question.typeName}
                onChange={e => handleChange('typeName', e.target.value)}
                className='w-full border rounded p-2'
              >
                <option value='MultipleChoice'>Trắc nghiệm nhiều đáp án</option>
                <option value='TrueFalse'>Đúng/Sai</option>
                <option value='ShortAnswer'>Trả lời ngắn</option>
                <option value='Essay'>Tự luận</option>
              </select>
            </div>
          </div>

          {/* Hình ảnh minh họa */}
          <div>
            <p className='font-bold mb-1'>Hình ảnh minh họa:</p>
            {question.image && (
              <div className='mt-2 flex flex-wrap gap-3'>
                {question.image.split(/[;,]/).map((url, i) => (
                  <img
                    key={i}
                    src={url.trim()}
                    alt={`Ảnh ${i + 1}`}
                    className='max-h-40 rounded border'
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-4'>
          <PrimaryButton
            onClick={handleSave}
            className='bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg'
          >
            Thêm
          </PrimaryButton>
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

export default AddQuestionModel;
