import { useState } from 'react';
import { Combobox } from '@headlessui/react';

const ManualCreateQuestion = ({ question, setQuestion, topics }) => {
  const [query, setQuery] = useState('');

  const filteredTopics =
    query === ''
      ? topics
      : topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  const handleChange = (field, value) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className='w-full max-w-4xl mx-auto space-y-5 text-gray-700'>
      {/* Chủ đề */}
      <div>
        <label className='block text-sm font-medium mb-1'>Chủ đề:</label>
        <Combobox
          value={question.topicId}
          onChange={val => handleChange('topicId', val)}
        >
          <div className='relative'>
            <Combobox.Input
              className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
              displayValue={id => topics.find(t => t.id === id)?.name || ''}
              onChange={e => setQuery(e.target.value)}
              placeholder='Tìm chủ đề...'
            />
            <Combobox.Options className='absolute mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto z-10'>
              {filteredTopics.length === 0 ? (
                <div className='p-2 text-gray-500'>Không tìm thấy chủ đề</div>
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
        <label className='block text-sm font-medium mb-1'>Nội dung:</label>
        <textarea
          rows={6}
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          value={question.content}
          onChange={e => handleChange('content', e.target.value)}
          placeholder='Nội dung câu hỏi'
        />
      </div>

      {/* Đáp án */}
      <div>
        <label className='block text-sm font-medium mb-1'>Đáp án:</label>
        <div className='space-y-2'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <input
              key={i}
              type='text'
              className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
              placeholder={`Đáp án ${i}`}
              value={question[`answer${i}`] || ''}
              onChange={e => handleChange(`answer${i}`, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* URL hình ảnh */}
      <div>
        <label className='block text-sm font-medium mb-1'>URL hình ảnh:</label>
        <textarea
          rows={2}
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          placeholder='Nhập URL ảnh, phân cách bằng dấu phẩy hoặc chấm phẩy'
          value={question.image}
          onChange={e => handleChange('image', e.target.value)}
        />
      </div>

      {/* Mức độ & Loại */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Mức độ:</label>
          <select
            value={question.levelName}
            onChange={e => handleChange('levelName', e.target.value)}
            className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          >
            <option value='NhậnBiết'>Nhận biết</option>
            <option value='ThôngHiểu'>Thông hiểu</option>
            <option value='VậnDụng'>Vận dụng</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Loại:</label>
          <select
            value={question.typeName}
            onChange={e => handleChange('typeName', e.target.value)}
            className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          >
            <option value='MultipleChoice'>Trắc nghiệm nhiều đáp án</option>
            <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
            <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
            <option value='Essay'>Tự luận</option>
          </select>
        </div>
      </div>

      {/* Hình ảnh minh họa */}
      {question.image && (
        <div>
          <label className='block text-sm font-medium mb-1'>
            Hình ảnh minh họa:
          </label>
          <div className='mt-2 flex flex-wrap gap-3'>
            {question.image.split(/[;,]/).map((url, i) => (
              <img
                key={i}
                src={url.trim()}
                alt={`Ảnh ${i + 1}`}
                className='max-h-40 rounded border border-gray-300'
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualCreateQuestion;
