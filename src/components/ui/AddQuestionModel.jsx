import { useState, useEffect, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getTopicbyGrade } from '@/services/topicService';
import { toast } from 'react-toastify';
import { supabase } from '@/supabase/supabaseClient';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import { FaPlus } from 'react-icons/fa';
import CommonButton from '@/components/ui/CommonButton';
import { postQuestion, postQuestionMedia } from '@/services/questionService';
import { MdClear } from 'react-icons/md';

const AddQuestionModel = ({ onClose, onSave }) => {
  const [question, setQuestion] = useState({
    topicId: '',
    content: '',
    levelName: '',
    typeName: '',
    image: '',
  });
  const [answers, setAnswers] = useState(['']);
  const [topics, setTopics] = useState([]);
  const [query, setQuery] = useState('');
  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  const [grade, setGrade] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

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

  useEffect(() => {
    if (grade) {
      (async () => {
        try {
          const response = await getTopicbyGrade(grade);

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

  const removeImageFile = index => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = index => {
    const urls = question.image.split(/[;,]/).map(url => url.trim());
    urls.splice(index, 1);
    handleChange('image', urls.join(';'));
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

  const handleImageUpload = e => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    toast.success('Ảnh đã được chọn! Sẽ được tải lên khi nhấn "Thêm".');
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

  const handleSave = async e => {
    e.preventDefault();

    if (!question.content?.trim()) {
      toast.error('Nội dung câu hỏi không được để trống');
      return;
    }

    if (!question.levelName || !question.typeName) {
      toast.error('Vui lòng chọn mức độ và loại câu hỏi!');
      return;
    }

    if (!grade || isNaN(Number(grade))) {
      toast.error('Vui lòng chọn khối lớp!');
      return;
    }

    const typeValue = typeMap[question.typeName];
    if (typeValue === undefined) {
      toast.error('Loại câu hỏi không hợp lệ!');
      return;
    }

    try {
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(
          imageFiles.map(file => uploadImageToSupabase(file))
        );
      }

      const urlImages = question.image
        ? question.image
            .split(/[;,]/)
            .map(url => url.trim())
            .filter(Boolean)
        : [];

      const finalImages = [...urlImages, ...uploadedImageUrls];

      const payload = {
        topicId: selectedTopicId || null,
        content: question.content,
        level: levelMap[question.levelName],
        type: typeValue,
        grade: Number(grade),
        image: finalImages.join(';'),
      };

      payload.image = finalImages.join(';');

      answers.forEach((ans, index) => {
        if (ans?.trim()) {
          payload[`answer${index + 1}`] = ans.trim();
        }
      });

      if (typeValue === 3 && !payload.answer1) {
        payload.answer1 = '';
      }

      const response = await postQuestion(payload);
      const createdQuestion = response?.data?.data;
      if (!createdQuestion?.id) {
        throw new Error('Không có ID câu hỏi trả về!');
      }

      const allImageUrls = [...uploadedImageUrls, ...urlImages];

      await Promise.all(
        allImageUrls.map(url =>
          postQuestionMedia({
            questionId: createdQuestion.id,
            mediaType: 'Image',
            url,
          })
        )
      );

      toast.success('Thêm câu hỏi thành công');

      setQuestion({
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
      });
      setImageFiles([]);
      onClose();
      onSave();
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      toast.error('Lỗi thêm câu hỏi!');
    }
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

        <div className='flex items-center text-sm text-gray-600 gap-1 italic'>
          <span>
            Những trường có dấu {''}
            <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
            điền
          </span>
        </div>

        <div className='space-y-4 text-gray-700'>
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
                              active
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700'
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

          {/*Nội dung:*/}
          <div>
            <label className='block text-sm font-bold mb-1'>
              Nội dung câu hỏi: <span className='text-red-600'>*</span>
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

          {/*Đáp án:*/}
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

          {/*Hình ảnh:*/}
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

          {/*Mức độ:*/}
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
                <option value='NhậnBiết'>Nhận biết</option>
                <option value='ThôngHiểu'>Thông hiểu</option>
                <option value='VậnDụng'>Vận dụng</option>
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

          {(question.image || imageFiles.length > 0) && (
            <div>
              <label className='block text-sm font-bold mb-1'>
                Hình ảnh minh họa:
              </label>
              <div className='mt-2 flex flex-wrap gap-3'>
                {/* Ảnh từ URL có sẵn */}
                {question.image &&
                  question.image.split(/[;,]/).map((url, i) => (
                    <div key={`url-${i}`} className='relative inline-block'>
                      <img
                        src={url.trim()}
                        alt={`Ảnh URL ${i + 1}`}
                        className='max-h-40 rounded border border-gray-300'
                      />
                      <button
                        type='button'
                        onClick={() => removeImageUrl(i)}
                        className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                        title='Xóa ảnh URL'
                      >
                        <MdClear size={22} />
                      </button>
                    </div>
                  ))}

                {/* Ảnh từ file vừa chọn */}
                {imageFiles?.map((file, i) => (
                  <div key={`file-${i}`} className='relative inline-block'>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Ảnh mới ${i + 1}`}
                      className='max-h-40 rounded border border-gray-300'
                    />
                    <button
                      type='button'
                      onClick={() => removeImageFile(i)}
                      className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                      title='Xóa ảnh'
                    >
                      <MdClear size={22} />
                    </button>
                  </div>
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
