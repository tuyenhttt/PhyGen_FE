import { useState, useEffect, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getTopic } from '@/services/topicService';
import { toast } from 'react-toastify';
import { supabase } from '@/supabase/supabaseClient';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import { FaPlus } from 'react-icons/fa';
import CommonButton from '@/components/ui/CommonButton';

const AddQuestionModel = ({ onClose, onSave }) => {
  const [question, setQuestion] = useState({
    topicId: '',
    content: '',
    levelName: 'NhậnBiết',
    typeName: 'MultipleChoice',
    image: '',
  });
  const [answers, setAnswers] = useState(['']);
  const [topics, setTopics] = useState([]);
  const [query, setQuery] = useState('');
  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);

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

  const uploadImageToSupabase = async file => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `questionmedias/${fileName}`;

    const { error } = await supabase.storage
      .from('questionmedias')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('questionmedias')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageUpload = async e => {
    const files = Array.from(e.target.files);

    try {
      const uploadedUrls = await Promise.all(
        files.map(file => uploadImageToSupabase(file))
      );

      const newImageString = uploadedUrls.join(';');
      const oldImages = question.image
        ? question.image.split(/[;,]/).map(s => s.trim())
        : [];

      setQuestion(prev => ({
        ...prev,
        image: [...oldImages, ...uploadedUrls].join(';'),
      }));

      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi upload ảnh lên Supabase');
    }
  };

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

  const handleSave = () => {
    const questionWithAnswers = { ...question };
    answers.forEach((ans, idx) => {
      questionWithAnswers[`answer${idx + 1}`] = ans;
    });
    onSave(questionWithAnswers);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div className='relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto'>
        <button
          className='absolute top-5 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold'
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className='text-2xl font-bold text-gray-800 pb-3'>
          Thêm câu hỏi mới
        </h2>

        <div className='space-y-4 text-gray-700'>
          <div>
            <p className='block text-sm font-bold mb-1'>Chủ đề:</p>
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
            <label className='block text-sm font-bold mb-1 mt-5'>
              Xem trước:
            </label>
            <div className='mt-4 p-5 border border-gray-200 rounded bg-gray-50'>
              <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
                <MathJax dynamic>
                  <div className='whitespace-pre-line text-base text-gray-800'>
                    {question.content}
                  </div>
                </MathJax>
              </MathJaxContext>
            </div>
          </div>

          <div className='space-y-4'>
            <label className='block text-sm font-bold mb-1'>Đáp án:</label>
            {answers.map((ans, idx) => (
              <div key={idx}>
                <input
                  ref={el => (answerRefs.current[idx] = el)}
                  type='text'
                  className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                  placeholder={`Đáp án ${idx + 1}`}
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

          <div className='space-y-4'>
            <label className='block text-sm font-bold mb-3'>
              Chọn hình ảnh
            </label>
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
              <p className='text-sm font-bold text-gray-600 mb-1 flex items-center gap-2'>
                <i className='fas fa-upload text-green-500'></i> Tải ảnh từ
                thiết bị
              </p>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={handleImageUpload}
                className='block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Ảnh sẽ được tự động tải lên và thêm vào danh sách URL.
              </p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-6'>
            <div className='w-full sm:w-1/2'>
              <p className='block text-sm font-bold mb-1'>Mức độ:</p>
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
              <p className='block text-sm font-bold mb-1'>Loại:</p>
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

          {question.image && (
            <div>
              <p className='block text-sm font-bold mb-1'>Hình ảnh minh họa:</p>
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
            </div>
          )}
        </div>

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
