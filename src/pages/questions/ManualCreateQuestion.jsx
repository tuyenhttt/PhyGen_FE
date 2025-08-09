import { useRef, useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import CommonButton from '@/components/ui/CommonButton';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getTopicbyGrade } from '@/services/topicService';
import { MdClear } from 'react-icons/md';

const ManualCreateQuestion = ({
  question,
  setQuestion,
  onImageUpload,
  imageFiles,
  setImageFiles,
}) => {
  const [query, setQuery] = useState('');
  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  const [answers, setAnswers] = useState(['']);
  const [grade, setGrade] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const insertLatex = latex => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = question.content || '';

    const updated = value.substring(0, start) + latex + value.substring(end);

    handleChange('content', updated);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + latex.length;
      textarea.focus();
    }, 0);
  };

  const insertLatexToAnswer = (index, latex) => {
    const input = answerRefs.current[index];
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = answers[index] || '';
    const updated =
      currentValue.substring(0, start) + latex + currentValue.substring(end);

    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = updated;
      return newAnswers;
    });

    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + latex.length;
      input.focus();
    }, 0);
  };

  const filteredTopics =
    query === ''
      ? topics
      : topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  const handleChange = (field, value) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const addAnswer = () => {
    setAnswers(prev => [...prev, '']);
  };

  const removeImageUrl = index => {
    const urls = question.image
      ?.split(/[;,]/)
      .map(u => u.trim())
      .filter(Boolean);
    urls.splice(index, 1);
    setQuestion(prev => ({ ...prev, image: urls.join(';') }));
  };

  const removeImageFile = index => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  useEffect(() => {
    if (grade) {
      (async () => {
        try {
          const response = await getTopicbyGrade(grade);
          console.log(response.data);

          const list = Array.isArray(response.data?.data)
            ? response.data.data
            : [];
          setTopics(list);
        } catch (err) {
          console.error('Lỗi khi lấy chủ đề:', err);
          toast.error('Không thể tải danh sách chủ đề');
        }
      })();
    } else {
      setTopics([]);
    }
  }, [grade]);

  useEffect(() => {
    setSelectedTopicId('');
    setQuery('');
  }, [grade]);

  useEffect(() => {
    setQuestion(prev => ({ ...prev, topicId: selectedTopicId }));
  }, [selectedTopicId]);

  useEffect(() => {
    const newQuestion = { ...question };
    answers.forEach((ans, idx) => {
      newQuestion[`answer${idx + 1}`] = ans;
    });
    setQuestion(newQuestion);
  }, [answers]);

  return (
    <div className='w-full max-w-4xl mx-auto space-y-5 text-gray-700'>
      <div className='flex items-center text-sm text-gray-600 gap-1 italic'>
        <span>
          Những trường có dấu {''}
          <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
          điền
        </span>
      </div>
      <div className='flex flex-col sm:flex-row gap-4 items-end'>
        {/*Lớp*/}
        <div className='w-full sm:w-1/4'>
          <p className='block text-sm font-bold mb-1'>
            Khối lớp : <span className='text-red-600'>*</span>
          </p>
          <select
            value={grade}
            onChange={e => {
              setGrade(e.target.value);
              setSelectedTopicId('');
              setQuery('');
              setQuestion(prev => ({ ...prev, grade: e.target.value }));
            }}
            className='w-full border rounded p-2'
          >
            <option value=''>Chọn lớp</option>
            <option value='10'>Lớp 10</option>
            <option value='11'>Lớp 11</option>
            <option value='12'>Lớp 12</option>
          </select>
        </div>

        {/*Chủ đề*/}
        <div className='w-full sm:w-3/4'>
          <p className='block text-sm font-bold mb-1'>Chủ đề:</p>
          <Combobox value={selectedTopicId} onChange={setSelectedTopicId}>
            <div className='relative'>
              <Combobox.Input
                className='w-full border rounded p-2'
                displayValue={id => {
                  const sel = topics.find(t => t.id === id);
                  return sel?.name || '';
                }}
                onChange={e => setQuery(e.target.value)}
                placeholder='Nhập từ khóa để hiện gợi ý chủ đề...'
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
      </div>

      {/* Nội dung */}
      <div>
        <label className='block text-sm font-bold mb-1'>
          Nội dung câu hỏi:
        </label>
        <textarea
          ref={textAreaRef}
          rows={5}
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          value={question.content}
          onChange={e => handleChange('content', e.target.value)}
          placeholder='Nhập nội dung vào đây và nhập công thức vào ô bên dưới (nếu có) sau đó nhấn chèn công thức'
        />

        <div className='mt-4'>
          <InsertableMathField onInsertLatex={insertLatex} />
        </div>

        {/* Xem trước */}
        <label className='block text-sm font-bold mb-1 mt-5'>Xem trước:</label>
        <div className='mt-4 p-5 border border-gray-200 rounded bg-gray-50'>
          <MathJaxContext
            config={{
              tex: {
                inlineMath: [['$', '$']],
              },
            }}
          >
            <MathJax dynamic>
              <div className='whitespace-pre-line text-base text-gray-800'>
                {question.content}
              </div>
            </MathJax>
          </MathJaxContext>
        </div>
      </div>

      {/* Đáp án */}
      <div className='space-y-4'>
        <label className='block text-sm font-bold mb-1'>Đáp án:</label>
        {answers.map((ans, idx) => (
          <div key={idx}>
            <input
              ref={el => (answerRefs.current[idx] = el)}
              type='text'
              className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
              placeholder={`Đáp án ${
                idx + 1
              }, nhập công thức vào ô bên dưới (nếu có) sau đó nhấn chèn công thức`}
              value={ans}
              onChange={e => handleAnswerChange(idx, e.target.value)}
            />
            <div className='mt-2'>
              <InsertableMathField
                onInsertLatex={latex => insertLatexToAnswer(idx, latex)}
              />
            </div>
          </div>
        ))}
        <CommonButton
          onClick={addAnswer}
          className='flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md transition-all duration-200 active:scale-95'
        >
          <FaPlus className='text-base' />
          <span>Thêm đáp án</span>
        </CommonButton>
      </div>

      {/* URL hình ảnh */}
      <div className='space-y-4'>
        <label className='block text-sm font-medium mb-3'>Chọn hình ảnh</label>
        <div>
          <p className='text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2'>
            <i className='fas fa-link text-blue-500'></i> Nhập URL ảnh (tùy
            chọn)
          </p>
          <textarea
            rows={2}
            className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
            placeholder='Nhập URL ảnh, phân cách bằng dấu phẩy hoặc chấm phẩy'
            value={question.image}
            onChange={e => handleChange('image', e.target.value)}
          />
        </div>

        <div className='flex items-center gap-4 my-2'>
          <div className='flex-grow border-t border-dashed border-gray-300'></div>
          <span className='text-sm text-gray-400'>Hoặc</span>
          <div className='flex-grow border-t border-dashed border-gray-300'></div>
        </div>

        <div>
          <p className='text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2'>
            <i className='fas fa-upload text-green-500'></i> Tải ảnh từ thiết bị
          </p>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={onImageUpload}
            className='block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Ảnh sẽ được tải lên khi bạn nhấn "Tải lên" câu hỏi.
          </p>
        </div>
      </div>

      {/* Mức độ & Loại */}
      <div className='flex flex-col sm:flex-row gap-6'>
        <div className='w-full sm:w-1/2'>
          <p className='block text-sm font-bold mb-1'>
            Mức độ: <span className='text-red-600'>*</span>
          </p>
          <select
            value={question.levelName}
            onChange={e => handleChange('levelName', e.target.value)}
            className='w-full border rounded p-2'
          >
            <option value=''>Chọn mức độ</option>
            <option value='Medium'>Thông hiểu</option>
            <option value='Easy'>Nhận biết</option>
            <option value='Hard'>Vận dụng</option>
          </select>
        </div>
        <div className='w-full sm:w-1/2'>
          <p className='block text-sm font-bold mb-1'>
            Loại: <span className='text-red-600'>*</span>
          </p>
          <select
            value={question.typeName}
            onChange={e => handleChange('typeName', e.target.value)}
            className='w-full border rounded p-2'
          >
            <option value=''>Chọn loại câu hỏi</option>
            <option value='MultipleChoice'>Trắc nghiệm nhiều đáp án</option>
            <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
            <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
            <option value='Essay'>Tự luận</option>
          </select>
        </div>
      </div>

      {/* Ảnh từ URL có sẵn */}
      {question.image &&
        question.image.split(/[;,]/).map((url, i) => (
          <div key={`url-${i}`} className='relative inline-block'>
            <img
              src={url.trim()}
              alt={`Ảnh ${i + 1}`}
              className='max-h-40 rounded border border-gray-300'
            />
            <button
              type='button'
              onClick={() => removeImageUrl(i)}
              className='absolute top-0 right-0 bg-white border border-gray-300 rounded-full p-1 text-red-500 hover:bg-red-500 hover:text-white text-xs'
              title='Xoá ảnh URL'
            >
              ✖
            </button>
          </div>
        ))}

      {/* Ảnh từ file vừa chọn */}
      {imageFiles.map((file, i) => (
        <div key={`file-${i}`} className='relative inline-block'>
          <img
            src={URL.createObjectURL(file)}
            alt={`Ảnh mới ${i + 1}`}
            className='max-h-40 rounded border border-gray-300'
          />
          <button
            type='button'
            onClick={() => removeImageFile(i)}
            className='absolute top-0 right-0 bg-white border border-gray-300 rounded-full p-1 text-red-500 hover:bg-red-500 hover:text-white text-xs'
            title='Xoá ảnh tải lên'
          >
            <MdClear size={22} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ManualCreateQuestion;
