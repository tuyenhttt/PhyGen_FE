import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
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
  const [query, setQuery] = useState('');

  const levelMap = { NhậnBiết: 0, ThôngHiểu: 1, VậnDụng: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const filteredTopics =
    query === ''
      ? topics
      : topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

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
            <Combobox
              value={question.topicId}
              onChange={val => handleChange('topicId', val)}
            >
              <div className='relative'>
                <Combobox.Input
                  className='w-full border rounded p-2'
                  displayValue={id => {
                    const sel = topics.find(t => t.id === id);
                    return sel?.name || '';
                  }}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Tìm chủ đề...'
                />
                <Combobox.Options className='absolute mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto z-10'>
                  {filteredTopics.length === 0 ? (
                    <div className='p-2 text-gray-500'>
                      Không tìm thấy chủ đề
                    </div>
                  ) : (
                    filteredTopics.map(t => (
                      <Combobox.Option
                        key={t.id}
                        value={t.id}
                        className={({ active }) =>
                          `cursor-pointer select-none p-2 ${
                            active ? 'bg-blue-600 text-white' : 'text-gray-700'
                          }`
                        }
                      >
                        {t.name}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>

          {/* Nội dung */}
          <div>
            <p className='font-bold mb-1'>Nội dung:</p>
            <textarea
              rows={6}
              className='w-full border rounded p-2'
              value={question.content}
              placeholder='Nội dung câu hỏi'
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
                <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
                <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
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

        {/* Nút Lưu / Đóng */}
        <div className='flex justify-end gap-3 pt-4'>
          <button
            onClick={onClose}
            className='border border-gray-300 text-gray-700 hover:bg-gray-100 px-5 py-2 rounded-lg'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={handleSave}
            className='bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg'
          >
            Thêm
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModel;
