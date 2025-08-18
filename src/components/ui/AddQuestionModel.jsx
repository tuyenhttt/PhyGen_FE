import { useState, useEffect, useRef } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import { supabase } from '@/supabase/supabaseClient';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import { FaPlus } from 'react-icons/fa';
import CommonButton from '@/components/ui/CommonButton';
import { postQuestion, postQuestionMedia } from '@/services/questionService';
import { MdClear } from 'react-icons/md';
import ConfirmModal from '@/components/ui/ConfirmModal';

import { getSubjectBooksByGradePath } from '@/services/subjectbooksService';
import { getChapterBySubjectBooks } from '@/services/chapterService';
import { getTopicsByChapter } from '@/services/topicService';

const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

const dedupe = arr => {
  const byId = new Set();
  const byName = new Set();
  const out = [];
  for (const x of arr || []) {
    const id = x?.id || x?.ID;
    const name = (x?.name || x?.title || '').toString().trim().toLowerCase();
    if (id) {
      if (byId.has(id)) continue;
      byId.add(id);
    } else if (name) {
      if (byName.has(name)) continue;
      byName.add(name);
    }
    out.push({ id: id ?? name, name: x?.name || x?.title || '—' });
  }
  return out;
};

const AddQuestionModel = ({ onClose, onSave }) => {
  const [question, setQuestion] = useState({
    topicId: '',
    content: '',
    levelName: '',
    typeName: '',
    image: '',
  });
  const [answers, setAnswers] = useState(['']);

  // Chuỗi chọn (KHÔNG BẮT BUỘC cho sách/chương/bài)
  const [grade, setGrade] = useState('');
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [bookId, setBookId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  const [imageFiles, setImageFiles] = useState([]);

  // confirm rời khỏi khi có thay đổi
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // ----- Dirty detect -----
  useEffect(() => {
    const hasText = !!question.content?.trim();
    const hasMeta =
      !!question.levelName ||
      !!question.typeName ||
      !!grade ||
      !!selectedTopicId ||
      !!bookId ||
      !!chapterId;
    const hasAns = answers.some(a => (a || '').trim() !== '');
    const hasImages = !!question.image?.trim() || imageFiles.length > 0;
    setIsDirty(hasText || hasMeta || hasAns || hasImages);
  }, [
    question,
    answers,
    grade,
    selectedTopicId,
    bookId,
    chapterId,
    imageFiles,
  ]);

  useEffect(() => {
    const onBeforeUnload = e => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    if (isDirty) window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // ----- Lấy sách theo grade (tuỳ chọn) -----
  useEffect(() => {
    setBookId('');
    setChapterId('');
    setSelectedTopicId('');
    setBooks([]);
    setChapters([]);
    setTopics([]);

    if (!grade) return;
    (async () => {
      try {
        const res = await getSubjectBooksByGradePath(grade);
        const raw = res?.data?.data?.data ?? res?.data?.data ?? [];
        const mapped = (Array.isArray(raw) ? raw : []).map(x => ({
          id: x.id,
          name: x.name || x.title || '—',
          grade: x.grade ?? x.Grade ?? Number(grade),
        }));
        setBooks(mapped);
      } catch (e) {
        console.error('Lỗi tải Sách theo lớp:', e);
        toast.error('Không thể tải danh sách Sách của lớp đã chọn.');
      }
    })();
  }, [grade]);

  // ----- Lấy chương theo sách (tuỳ chọn) -----
  useEffect(() => {
    setChapterId('');
    setSelectedTopicId('');
    setChapters([]);
    setTopics([]);

    if (!bookId) return;
    (async () => {
      try {
        const res = await getChapterBySubjectBooks(bookId, 1, 500);
        const raw = res?.data?.data?.data ?? res?.data?.data ?? [];
        const mapped = (Array.isArray(raw) ? raw : []).map(x => ({
          id: x.id,
          name: x.name || x.title || '—',
        }));
        setChapters(mapped);
      } catch (e) {
        console.error('Lỗi tải Chương:', e);
        toast.error('Không thể tải danh sách Chương.');
      }
    })();
  }, [bookId]);

  // ----- Lấy bài theo chương (tuỳ chọn) -----
  useEffect(() => {
    setSelectedTopicId('');
    setTopics([]);

    if (!chapterId) return;
    (async () => {
      try {
        const res = await getTopicsByChapter(chapterId, {
          PageIndex: 1,
          PageSize: 500,
        });
        const raw = res?.data?.data?.data ?? res?.data?.data ?? [];
        const mapped = (Array.isArray(raw) ? raw : []).map(x => ({
          id: x.id,
          name: x.name || x.title || '—',
        }));
        setTopics(dedupe(mapped));
      } catch (e) {
        console.error('Lỗi tải Bài:', e);
        toast.error('Không thể tải danh sách Bài.');
      }
    })();
  }, [chapterId]);

  // ----- Handlers -----
  const handleChange = (field, value) =>
    setQuestion(prev => ({ ...prev, [field]: value }));

  const handleAnswerChange = (index, value) =>
    setAnswers(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const addAnswer = () => setAnswers(prev => [...prev, '']);

  const removeImageFile = index =>
    setImageFiles(prev => prev.filter((_, i) => i !== index));

  const removeImageUrl = index => {
    const urls = question.image
      ? question.image
          .split(/[;,]/)
          .map(url => url.trim())
          .filter(Boolean)
      : [];
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
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const value = question.content || '';
    const updated = value.substring(0, start) + latex + value.substring(end);
    handleChange('content', updated);
    setTimeout(() => {
      if (!textarea) return;
      textarea.selectionStart = textarea.selectionEnd = start + latex.length;
      textarea.focus();
    }, 0);
  };

  const insertLatexToAnswer = (index, latex) => {
    const input = answerRefs.current[index];
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;
    const currentValue = answers[index] || '';
    const updated =
      currentValue.substring(0, start) + latex + currentValue.substring(end);
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = updated;
      return newAnswers;
    });
    setTimeout(() => {
      if (!input) return;
      input.selectionStart = input.selectionEnd = start + latex.length;
      input.focus();
    }, 0);
  };

  // ----- SAVE -----
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
          imageFiles.map(uploadImageToSupabase)
        );
      }

      const urlImages = question.image
        ? question.image
            .split(/[;,]/)
            .map(url => url.trim())
            .filter(Boolean)
        : [];

      const finalImages = [...urlImages, ...uploadedImageUrls];

      // Sách/Chương/Bài: KHÔNG BẮT BUỘC -> chỉ đính kèm nếu có
      const payload = {
        topicId: selectedTopicId || null,
        content: question.content,
        level: levelMap[question.levelName],
        type: typeValue,
        grade: Number(grade),
        image: finalImages.join(';'),
        ...(bookId ? { subjectBookId: bookId } : {}),
        ...(chapterId ? { chapterId } : {}),
      };

      answers.forEach((ans, index) => {
        if ((ans || '').trim()) payload[`answer${index + 1}`] = ans.trim();
      });
      if (typeValue === 3 && !payload.answer1) payload.answer1 = '';

      const response = await postQuestion(payload);
      const createdQuestion = response?.data?.data;
      if (!createdQuestion?.id) throw new Error('Không có ID câu hỏi trả về!');

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

      // reset nhanh
      setQuestion({
        topicId: '',
        content: '',
        levelName: '',
        typeName: '',
        image: '',
      });
      setAnswers(['']);
      setImageFiles([]);
      setSelectedTopicId('');
      setChapterId('');
      setBookId('');
      setBooks([]);
      setChapters([]);
      setTopics([]);
      setGrade('');

      onClose?.();
      onSave?.();
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      toast.error('Lỗi thêm câu hỏi!');
    }
  };

  // ----- CLOSE (confirm nếu dirty) -----
  const requestClose = () => {
    if (isDirty) setShowConfirmLeave(true);
    else onClose?.();
  };
  const confirmLeave = () => {
    setShowConfirmLeave(false);
    onClose?.();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div className='relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto'>
        <button
          className='absolute top-5 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold'
          onClick={requestClose}
        >
          &times;
        </button>

        <h2 className='text-2xl font-bold text-gray-800 pb-3'>
          Thêm câu hỏi mới
        </h2>

        <div className='flex items-center text-sm text-gray-600 gap-1 italic'>
          <span>
            Những trường có dấu{' '}
            <span className='text-red-500 font-semibold'>*</span> bắt buộc phải
            điền
          </span>
        </div>

        {/* Hàng 1: Lớp + Sách (Sách không bắt buộc) */}
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 items-end'>
          <div>
            <p className='block text-[16px] font-bold mb-1'>
              Khối lớp : <span className='text-red-600'>*</span>
            </p>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className='w-full border rounded p-2'
            >
              <option value=''>Chọn lớp</option>
              <option value='10'>Lớp 10</option>
              <option value='11'>Lớp 11</option>
              <option value='12'>Lớp 12</option>
            </select>
          </div>

          <div className='sm:col-span-3'>
            <p className='block text-[16px] font-bold mb-1'>Sách:</p>
            <select
              value={bookId}
              onChange={e => setBookId(e.target.value)}
              className='w-full border rounded p-2'
            >
              <option value=''>Chọn sách</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.grade ? ` - Lớp ${b.grade}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hàng 2: Chương + Bài (đều không bắt buộc) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-end'>
          <div>
            <p className='block text-[16px] font-bold mb-1'>Chương:</p>
            <select
              value={chapterId}
              onChange={e => setChapterId(e.target.value)}
              className='w-full border rounded p-2'
              disabled={!bookId}
            >
              <option value=''>
                {!bookId ? 'Chọn sách trước' : 'Chọn chương'}
              </option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className='block text-[16px] font-bold mb-1'>Bài học:</p>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className='w-full border rounded p-2'
              disabled={!chapterId}
            >
              <option value=''>
                {!chapterId ? 'Chọn chương trước' : 'Chọn bài'}
              </option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mức độ & Loại */}
        <div className='flex flex-col sm:flex-row gap-6'>
          <div className='w-full sm:w-1/2'>
            <p className='block text-[16px] font-bold mb-1'>
              Mức độ: <span className='text-red-600'>*</span>
            </p>
            <select
              value={question.levelName}
              onChange={e => handleChange('levelName', e.target.value)}
              className='w-full border rounded p-2'
            >
              <option value=''>Chọn mức độ</option>
              <option value='Easy'>Nhận biết</option>
              <option value='Medium'>Thông hiểu</option>
              <option value='Hard'>Vận dụng</option>
            </select>
          </div>
          <div className='w-full sm:w-1/2'>
            <p className='block text-[16px] font-bold mb-1'>
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

        {/* Nội dung */}
        <div>
          <label className='block text-[16px] font-bold mb-1'>
            Nội dung câu hỏi: <span className='text-red-600'>*</span>
          </label>
          <textarea
            ref={textAreaRef}
            rows={5}
            className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
            value={question.content}
            onChange={e => handleChange('content', e.target.value)}
            placeholder='Nhập nội dung vào đây và chèn công thức nếu có'
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

        {/* Ảnh */}
        <div className='space-y-4'>
          <label className='block text-[16px] font-bold mb-3'>
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
              <i className='fas fa-upload text-green-500'></i> Tải ảnh từ thiết
              bị
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

        {(question.image || imageFiles.length > 0) && (
          <div>
            <label className='block text-sm font-bold mb-1'>
              Hình ảnh minh họa:
            </label>
            <div className='mt-2 flex flex-wrap gap-3'>
              {question.image &&
                question.image
                  .split(/[;,]/)
                  .filter(Boolean)
                  .map((url, i) => (
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

        {/* Đáp án */}
        <div className='space-y-4'>
          <label className='block text-[16px] font-bold mb-1'>Đáp án:</label>
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

        {/* Footer */}
        <div className='flex justify-end gap-3 pt-4'>
          <button
            onClick={requestClose}
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

      {/* Confirm leave modal */}
      <ConfirmModal
        visible={showConfirmLeave}
        title='Rời khỏi mà không lưu?'
        onClose={() => setShowConfirmLeave(false)}
      >
        <p className='mb-6 text-gray-700'>
          Bạn đã có thay đổi chưa lưu. Bạn chắc chắn muốn đóng cửa sổ và bỏ các
          thay đổi?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setShowConfirmLeave(false)}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Ở lại
          </button>
          <PrimaryButton
            onClick={confirmLeave}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Rời khỏi
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default AddQuestionModel;
