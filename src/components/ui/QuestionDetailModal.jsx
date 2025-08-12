import { useEffect, useState, useRef } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import {
  deleteQuestionMedia,
  getQuestionMediaById,
  postQuestionMedia,
  updateQuestion,
} from '@/services/questionService';
import { toast } from 'react-toastify';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import { FaPlus } from 'react-icons/fa';
import CommonButton from '@/components/ui/CommonButton';
import { supabase } from '@/supabase/supabaseClient';
import { getTopicbyGrade } from '@/services/topicService';
import { Combobox } from '@headlessui/react';
import { MdClear } from 'react-icons/md';

const QuestionDetailModal = ({
  question,
  editMode,
  onClose,
  onSaveSuccess,
  onSaveLocal,
}) => {
  const [query, setQuery] = useState('');
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [answers, setAnswers] = useState([]);
  const [mediaImages, setMediaImages] = useState([]);
  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  const [topics, setTopics] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };
  const levelDisplayMap = { 0: 'Nhận biết', 1: 'Thông hiểu', 2: 'Vận dụng' };
  const typeDisplayMap = {
    0: 'Trắc nghiệm nhiều đáp án',
    1: 'Trắc nghiệm Đúng/Sai',
    2: 'Câu hỏi trả lời ngắn',
    3: 'Tự luận',
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy media
        if (question?.id) {
          const res = await getQuestionMediaById(question.id);
          const mediaList = Array.isArray(res?.data.data) ? res.data.data : [];
          const images = mediaList
            .filter(item => item.mediaType === 'Image')
            .map(item => ({ id: item.id, url: item.url }));
          setMediaImages(images);
        }

        // 2. Lấy topics theo grade
        let topicsList = [];
        if (question?.grade) {
          const resTopic = await getTopicbyGrade(question.grade);
          topicsList = Array.isArray(resTopic?.data?.data) ? resTopic.data.data : [];
          setTopics(topicsList);
        }

        // 3. Map topicId từ topicName
        let mappedTopicId = question.topicId || '';
        if (question?.topicName) {
          const foundTopic = topicsList.find(
            t => t?.name.trim() === question.topicName?.trim()
          );
          if (foundTopic) {
            mappedTopicId = foundTopic.id;
          }
        }
        setEditedQuestion({
          ...question,
          topicId: mappedTopicId,
          levelName: question.levelName || 'Easy',
          typeName: question.typeName || 'MultipleChoice',
          image: question.image || '',
        });

        const initialAnswers = [];
        for (let i = 1; i <= 6; i++) {
          if (question[`answer${i}`]) initialAnswers.push(question[`answer${i}`]);
        }
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Lỗi khi load dữ liệu:', err);
      }
    };

    fetchData();
  }, [question]);

  const handleDeleteMediaImage = async id => {
    try {
      await deleteQuestionMedia(id);
      setMediaImages(prev => prev.filter(img => img.id !== id));
      toast.success('Đã xoá ảnh!');
    } catch (err) {
      toast.error('Xoá ảnh thất bại!');
      console.error('Lỗi xoá media:', err);
    }
  };

  const handleChange = (field, value) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
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

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    toast.success('Đã chọn ảnh! Ảnh sẽ được tải lên khi bạn bấm "Lưu".');
  };

  const removeImageFile = index => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = index => {
    const urls = editedQuestion.image
      ?.split(/[;,]/)
      .map(u => u.trim())
      .filter(u => u);
    urls.splice(index, 1);
    handleChange('image', urls.join(';'));
  };

  const insertLatex = latex => {
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = editedQuestion.content || '';
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
    handleAnswerChange(index, updated);
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + latex.length;
      input.focus();
    }, 0);
  };

  const handleSave = async () => {
    try {
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await Promise.all(
          imageFiles.map(file => uploadImageToSupabase(file))
        );
      }

      const urlImages =
        typeof editedQuestion.image === 'string'
          ? editedQuestion.image
              .split(/[;,]/)
              .map(u => u.trim())
              .filter(Boolean)
          : [];

      const existingMediaUrls = mediaImages.map(img => img.url);

      const allImageUrls = [
        ...existingMediaUrls,
        ...urlImages,
        ...uploadedUrls,
      ];

      const imageString = allImageUrls.join(';');

      const payload = {
        ...editedQuestion,
        image: imageString,
        level: levelMap[editedQuestion.levelName] ?? 0,
        type: typeMap[editedQuestion.typeName] ?? 0,
      };

      answers.forEach((ans, idx) => {
        payload[`answer${idx + 1}`] = ans;
      });
      if (editedQuestion.id) {
        await updateQuestion(payload);

        const allNewImageUrls = [...uploadedUrls, ...urlImages];

        await Promise.all(
          allNewImageUrls.map(url =>
            postQuestionMedia({
              questionId: editedQuestion.id,
              mediaType: 'Image',
              url,
            })
          )
        );

        toast.success('Cập nhật thành công');
        onSaveSuccess?.();
      } else {
        onSaveLocal?.(payload);
        toast.success('Lưu thành công');
      }
      setImageFiles([]);
      onClose();
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      toast.error('Lỗi khi lưu câu hỏi!');
    }
  };

  const combinedImageList = [
    ...mediaImages,
    ...(editedQuestion.image
      ? editedQuestion.image.split(/[;,]/).map(url => url.trim())
      : []),
  ];

  const uniqueImageList = [...new Set(combinedImageList)];

  const totalImagesCount =
    mediaImages.length +
    (typeof editedQuestion.image === 'string'
      ? editedQuestion.image
          .split(/[;,]/)
          .map(url => url.trim())
          .filter(Boolean).length
      : 0) +
    imageFiles.length;

  const filteredTopics =
    query === ''
      ? topics
      : topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
        <div className='relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto'>
          <button
            className='absolute top-5 right-5 text-gray-400 hover:text-red-500 text-3xl font-bold'
            onClick={onClose}
          >
            &times;
          </button>

          <h2 className='text-2xl font-bold text-gray-800 pb-3'>
            {editMode ? 'Chỉnh sửa câu hỏi' : 'Chi tiết câu hỏi'}
          </h2>

          <div className='space-y-4 text-gray-700'>
            <div className='flex flex-col sm:flex-row sm:gap-10 pt-2'>
              {/* Lớp*/}
              <div className='w-full sm:w-1/4'>
                <p className='font-bold text-gray-800'>Khối lớp:</p>
                {editMode ? (
                  <select
                    value={editedQuestion.grade}
                    onChange={e => handleChange('grade', e.target.value)}
                    className='w-full border rounded p-2'
                  >
                    <option value=''>Chọn lớp</option>
                    <option value='10'>Lớp 10</option>
                    <option value='11'>Lớp 11</option>
                    <option value='12'>Lớp 12</option>
                  </select>
                ) : (
                  <p>{editedQuestion.grade}</p>
                )}
              </div>
              {/* Chủ đề */}
              <div className='w-full sm:w-3/4'>
                <p className='block text-sm font-bold mb-1'>Chủ đề:</p>
                {editMode ? (
                  <Combobox
                    value={editedQuestion.topicId}
                    onChange={value => handleChange('topicId', value)}
                  >
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
                ) : (
                  <p className='mt-2 text-gray-700 font-sm'>
                    {topics.find(t => t.id === editedQuestion.topicId)
                      ?.name || (
                      <span className='italic text-gray-400'>
                        Không có chủ đề
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Nội dung */}
            <div>
              <p className='font-bold text-gray-800 mb-1'>Nội dung:</p>
              {editMode ? (
                <>
                  <textarea
                    ref={textAreaRef}
                    className='w-full border rounded p-2'
                    rows={6}
                    value={editedQuestion.content || ''}
                    onChange={e => handleChange('content', e.target.value)}
                  />
                  <div className='mt-4'>
                    <InsertableMathField onInsertLatex={insertLatex} />
                  </div>
                  <label className='block text-sm font-bold mb-1 mt-5'>
                    Xem trước:
                  </label>
                  <div className='mt-4 p-5 border border-gray-200 rounded bg-gray-50'>
                    <MathJax dynamic>
                      <div className='whitespace-pre-line text-base text-gray-800'>
                        {editedQuestion.content}
                      </div>
                    </MathJax>
                  </div>
                </>
              ) : (
                <MathJax dynamic>
                  <div className='whitespace-pre-line leading-relaxed'>
                    {editedQuestion.content}
                  </div>
                </MathJax>
              )}
            </div>

            {editMode ? (
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
            ) : (
              <div>
                <p className='font-bold text-gray-800 mb-1'>Đáp án:</p>
                <ul className='space-y-1'>
                  {answers.map((ans, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    return (
                      <li key={idx}>
                        <MathJax dynamic>
                          <div>
                            <strong>{label}.</strong> {ans}
                          </div>
                        </MathJax>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {editMode && (
              <div className='space-y-4'>
                <label className='block text-sm font-bold mb-3'>
                  Chọn hình ảnh
                </label>
                <div>
                  <p className='text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2'>
                    <i className='fas fa-link text-blue-500'></i> Nhập URL ảnh
                    (tùy chọn)
                  </p>
                  <textarea
                    rows={2}
                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                    placeholder='Nhập URL ảnh, phân cách bằng dấu phẩy hoặc chấm phẩy'
                    value={editedQuestion.image || ''}
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
            )}

            <div className='flex flex-col sm:flex-row sm:gap-10 pt-2'>
              <div className='w-full sm:w-1/2'>
                <p className='font-bold text-gray-800'>Mức độ:</p>
                {editMode ? (
                  <select
                    value={editedQuestion.levelName}
                    onChange={e => handleChange('levelName', e.target.value)}
                    className='w-full border rounded p-2'
                  >
                    <option value='Easy'>Nhận biết</option>
                    <option value='Medium'>Thông hiểu</option>
                    <option value='Hard'>Vận dụng</option>
                  </select>
                ) : (
                  <p>
                    {levelDisplayMap[levelMap[editedQuestion.levelName]] || '—'}
                  </p>
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
                  <p>
                    {typeDisplayMap[typeMap[editedQuestion.typeName]] || '—'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className='font-bold text-gray-800 mb-1'>Hình ảnh minh hoạ:</p>

              {totalImagesCount === 0 && (
                <p className='text-gray-500 italic'>Không có hình ảnh</p>
              )}

              {/* 1. Ảnh đã upload trước đó (mediaImages) */}
              {mediaImages.map((img, idx) => (
                <div
                  key={`media-${idx}`}
                  className='relative inline-block mr-2'
                >
                  <img
                    src={img.url}
                    alt={`Ảnh đã upload ${idx + 1}`}
                    className='max-h-40 max-w-[160px] object-contain rounded border'
                  />
                  {editMode && (
                    <button
                      type='button'
                      onClick={() => handleDeleteMediaImage(img.id)}
                      className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                      title='Xoá ảnh đã upload'
                    >
                      <MdClear size={22} />
                    </button>
                  )}
                </div>
              ))}

              {/* 2. Ảnh từ URL nhập tay */}
              {typeof editedQuestion.image === 'string' &&
                editedQuestion.image
                  .split(/[;,]/)
                  .map(url => url.trim())
                  .filter(url => !!url)
                  .map((url, idx) => (
                    <div
                      key={`url-${idx}`}
                      className='relative inline-block mr-2'
                    >
                      <img
                        src={url}
                        alt={`Ảnh URL ${idx + 1}`}
                        className='max-h-40 rounded border border-gray-300'
                      />
                      {editMode && (
                        <button
                          type='button'
                          onClick={() => removeImageUrl(idx)}
                          className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                          title='Xoá ảnh URL'
                        >
                          <MdClear size={22} />
                        </button>
                      )}
                    </div>
                  ))}

              {/* 3. Ảnh mới được chọn (chưa upload) */}
              {imageFiles.map((file, idx) => (
                <div key={`file-${idx}`} className='relative inline-block mr-2'>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Mới ${idx + 1}`}
                    className='max-h-40 rounded border'
                  />
                  {editMode && (
                    <button
                      type='button'
                      onClick={() => removeImageFile(idx)}
                      className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                      title='Xoá ảnh tải lên'
                    >
                      <MdClear size={22} />
                    </button>
                  )}
                </div>
              ))}
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
    </MathJaxContext>
  );
};

export default QuestionDetailModal;
