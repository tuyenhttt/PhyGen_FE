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
import { MdClear } from 'react-icons/md';

import { getSubjectBooksByGradePath } from '@/services/subjectbooksService';
import { getChapterBySubjectBooks } from '@/services/chapterService';
import { getTopicsByChapter } from '@/services/topicService';

const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };
const levelDisplayMap = { 0: 'Nhận biết', 1: 'Thông hiểu', 2: 'Vận dụng' };
const typeDisplayMap = {
  0: 'Trắc nghiệm nhiều đáp án',
  1: 'Trắc nghiệm Đúng/Sai',
  2: 'Câu hỏi trả lời ngắn',
  3: 'Tự luận',
};

const dedupe = arr => {
  const seen = new Set();
  return (arr || []).reduce((acc, x) => {
    if (!x?.id || seen.has(x.id)) return acc;
    seen.add(x.id);
    acc.push({ id: x.id, name: x.name || x.title || '—' });
    return acc;
  }, []);
};

const QuestionDetailModal = ({
  question,
  editMode,
  onClose,
  onSaveSuccess,
  onSaveLocal,
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [answers, setAnswers] = useState([]);
  const [mediaImages, setMediaImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [grade, setGrade] = useState(
    question?.grade !== undefined && question?.grade !== null
      ? String(question.grade)
      : ''
  );
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [bookId, setBookId] = useState(question?.subjectBookId || '');
  const [chapterId, setChapterId] = useState(question?.chapterId || '');
  const [topicId, setTopicId] = useState(question?.topicId || '');

  const firstMount = useRef(true);

  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  useEffect(() => {
    (async () => {
      try {
        if (question?.id) {
          const res = await getQuestionMediaById(question.id);
          const mediaList = Array.isArray(res?.data?.data) ? res.data.data : [];
          setMediaImages(
            mediaList
              .filter(m => m.mediaType === 'Image')
              .map(m => ({ id: m.id, url: m.url }))
          );
        }
        const initialAnswers = [];
        for (let i = 1; i <= 6; i++) {
          if (question[`answer${i}`])
            initialAnswers.push(question[`answer${i}`]);
        }
        setAnswers(initialAnswers);

        setEditedQuestion(prev => ({
          ...prev,
          levelName: question.levelName || 'Easy',
          typeName: question.typeName || 'MultipleChoice',
          image: question.image || '',
          statusName:
            question.statusName ??
            { 0: 'Draft', 1: 'AIDraft', 2: 'Approved', 3: 'Removed' }[
              question.status
            ] ??
            'Draft',
        }));
      } catch (err) {
        console.error('Load init failed:', err);
      }
    })();
  }, [question]);

  useEffect(() => {
    firstMount.current = false;
  }, []);

  useEffect(() => {
    if (!grade) {
      setBooks([]);
      if (!firstMount.current) {
        setBookId('');
        setChapters([]);
        setChapterId('');
        setTopics([]);
        setTopicId('');
      }
      return;
    }

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
        setBooks([]);
        toast.error('Không thể tải danh sách Sách của lớp đã chọn.');
      }
    })();
  }, [grade]);

  useEffect(() => {
    if (!bookId) {
      setChapters([]);
      if (!firstMount.current) {
        setChapterId('');
        setTopics([]);
        setTopicId('');
      }
      return;
    }

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
        setChapters([]);
        toast.error('Không thể tải danh sách Chương.');
      }
    })();
  }, [bookId]);

  useEffect(() => {
    if (!chapterId) {
      setTopics([]);
      if (!firstMount.current) setTopicId('');
      return;
    }

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
        setTopics([]);
        toast.error('Không thể tải danh sách Bài.');
      }
    })();
  }, [chapterId]);

  useEffect(() => {
    setEditedQuestion(p => ({ ...p, grade: grade ? Number(grade) : '' }));
  }, [grade]);

  useEffect(() => {
    setEditedQuestion(p => ({ ...p, subjectBookId: bookId || null }));
  }, [bookId]);

  useEffect(() => {
    setEditedQuestion(p => ({ ...p, chapterId: chapterId || null }));
  }, [chapterId]);

  useEffect(() => {
    setEditedQuestion(p => ({ ...p, topicId: topicId || null }));
  }, [topicId]);

  const handleChange = (field, value) =>
    setEditedQuestion(prev => ({ ...prev, [field]: value }));

  const insertLatex = latex => {
    const ta = textAreaRef.current;
    const start = ta?.selectionStart ?? 0;
    const end = ta?.selectionEnd ?? 0;
    const val = editedQuestion.content || '';
    const updated = val.slice(0, start) + latex + val.slice(end);
    handleChange('content', updated);
    setTimeout(() => {
      if (!ta) return;
      ta.selectionStart = ta.selectionEnd = start + latex.length;
      ta.focus();
    }, 0);
  };

  const insertLatexToAnswer = (idx, latex) => {
    const input = answerRefs.current[idx];
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;
    const cur = answers[idx] || '';
    const updated = cur.slice(0, start) + latex + cur.slice(end);
    setAnswers(prev => {
      const n = [...prev];
      n[idx] = updated;
      return n;
    });
    setTimeout(() => {
      if (!input) return;
      input.selectionStart = input.selectionEnd = start + latex.length;
      input.focus();
    }, 0);
  };

  const uploadImageToSupabase = async file => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;
    const filePath = `questionmedias/${fileName}`;
    const { error } = await supabase.storage
      .from('questionmedias')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage
      .from('questionmedias')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageUpload = e => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    toast.success('Đã chọn ảnh! Ảnh sẽ được tải lên khi bấm "Lưu".');
  };
  const removeImageFile = i =>
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  const removeImageUrl = i => {
    const urls = (editedQuestion.image || '')
      .split(/[;,]/)
      .map(u => u.trim())
      .filter(Boolean);
    urls.splice(i, 1);
    handleChange('image', urls.join(';'));
  };

  const handleSave = async () => {
    try {
      let uploadedUrls = [];
      if (imageFiles.length) {
        uploadedUrls = await Promise.all(imageFiles.map(uploadImageToSupabase));
      }
      const urlImages =
        typeof editedQuestion.image === 'string'
          ? editedQuestion.image
              .split(/[;,]/)
              .map(u => u.trim())
              .filter(Boolean)
          : [];
      const existingMediaUrls = mediaImages.map(m => m.url);
      const imageString = [
        ...existingMediaUrls,
        ...urlImages,
        ...uploadedUrls,
      ].join(';');

      const payload = {
        ...editedQuestion,
        image: imageString,
        level: levelMap[editedQuestion.levelName] ?? 0,
        type: typeMap[editedQuestion.typeName] ?? 0,
      };
      answers.forEach((ans, idx) => (payload[`answer${idx + 1}`] = ans));

      if (editedQuestion.id) {
        await updateQuestion(payload);
        const newUrls = [...uploadedUrls, ...urlImages];
        await Promise.all(
          newUrls.map(url =>
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

  // --------- tên hiển thị (fallback nếu list chưa load)
  const bookName =
    books.find(b => b.id === (bookId || question?.subjectBookId))?.name ||
    editedQuestion.subjectBookName ||
    question?.subjectBookName ||
    '—';
  const chapterName =
    chapters.find(c => c.id === (chapterId || question?.chapterId))?.name ||
    editedQuestion.chapterName ||
    question?.chapterName ||
    '—';
  const topicName =
    topics.find(t => t.id === (topicId || question?.topicId))?.name ||
    editedQuestion.topicName ||
    question?.topicName ||
    '—';

  const totalImagesCount =
    mediaImages.length +
    (typeof editedQuestion.image === 'string'
      ? editedQuestion.image.split(/[;,]/).filter(Boolean).length
      : 0) +
    imageFiles.length;

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
            {/* Lớp */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Khối lớp:
              </span>
              {editMode ? (
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value=''>Chọn lớp</option>
                  <option value='10'>Lớp 10</option>
                  <option value='11'>Lớp 11</option>
                  <option value='12'>Lớp 12</option>
                </select>
              ) : (
                <span className='text-gray-700 flex-1 truncate'>
                  {grade || '—'}
                </span>
              )}
            </div>

            {/* Sách */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Sách:
              </span>
              {editMode ? (
                <select
                  value={bookId}
                  onChange={e => setBookId(e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value=''>
                    {books.length ? 'Chọn sách' : 'Không có sách'}
                  </option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.grade ? `- Lớp ${b.grade}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className='text-gray-700 flex-1 truncate'
                  title={bookName}
                >
                  {bookName}
                </span>
              )}
            </div>

            {/* Chương */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Chương:
              </span>
              {editMode ? (
                <select
                  value={chapterId}
                  onChange={e => setChapterId(e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value=''>
                    {bookId
                      ? chapters.length
                        ? 'Chọn chương'
                        : 'Chưa có chương'
                      : 'Hãy chọn Sách trước'}
                  </option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className='text-gray-700 flex-1 truncate'
                  title={chapterName}
                >
                  {chapterName}
                </span>
              )}
            </div>

            {/* Bài */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Bài học:
              </span>
              {editMode ? (
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value=''>
                    {chapterId
                      ? topics.length
                        ? 'Chọn bài'
                        : 'Chưa có bài'
                      : 'Hãy chọn Chương trước'}
                  </option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className='text-gray-700 flex-1 truncate'
                  title={topicName}
                >
                  {topicName}
                </span>
              )}
            </div>

            {/* Mức độ */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Mức độ:
              </span>
              {editMode ? (
                <select
                  value={editedQuestion.levelName}
                  onChange={e => handleChange('levelName', e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value='Easy'>Nhận biết</option>
                  <option value='Medium'>Thông hiểu</option>
                  <option value='Hard'>Vận dụng</option>
                </select>
              ) : (
                <span className='text-gray-700 flex-1 truncate'>
                  {levelDisplayMap[levelMap[editedQuestion.levelName]] || '—'}
                </span>
              )}
            </div>

            {/* Loại */}
            <div className='w-full flex items-center gap-2'>
              <span className='font-bold text-gray-800 whitespace-nowrap'>
                Loại:
              </span>
              {editMode ? (
                <select
                  value={editedQuestion.typeName}
                  onChange={e => handleChange('typeName', e.target.value)}
                  className='border rounded p-2 flex-1 min-w-0'
                >
                  <option value='MultipleChoice'>
                    Trắc nghiệm nhiều đáp án
                  </option>
                  <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
                  <option value='ShortAnswer'>Câu hỏi trả lời ngắn</option>
                  <option value='Essay'>Tự luận</option>
                </select>
              ) : (
                <span className='text-gray-700 flex-1 truncate'>
                  {typeDisplayMap[typeMap[editedQuestion.typeName]] || '—'}
                </span>
              )}
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

            {/* Ảnh */}
            <div>
              <p className='font-bold text-gray-800 mb-1'>Hình ảnh minh hoạ:</p>

              {totalImagesCount === 0 && (
                <p className='text-gray-500 italic'>Không có hình ảnh</p>
              )}

              {mediaImages.map((img, idx) => (
                <div
                  key={`media-${idx}`}
                  className='relative inline-block mr-2'
                >
                  <img
                    src={img.url}
                    alt=''
                    className='max-h-40 max-w-[160px] object-contain rounded border'
                  />
                  {editMode && (
                    <button
                      type='button'
                      onClick={async () => {
                        try {
                          await deleteQuestionMedia(img.id);
                          setMediaImages(prev =>
                            prev.filter(i => i.id !== img.id)
                          );
                          toast.success('Đã xoá ảnh!');
                        } catch {
                          toast.error('Xoá ảnh thất bại!');
                        }
                      }}
                      className='absolute top-0 right-0 bg-white rounded-full border border-gray-300 p-1 text-red-500 hover:text-white hover:bg-red-500 transition-all text-xs'
                      title='Xoá ảnh đã upload'
                    >
                      <MdClear size={22} />
                    </button>
                  )}
                </div>
              ))}

              {typeof editedQuestion.image === 'string' &&
                editedQuestion.image
                  .split(/[;,]/)
                  .map(u => u.trim())
                  .filter(Boolean)
                  .map((url, idx) => (
                    <div
                      key={`url-${idx}`}
                      className='relative inline-block mr-2'
                    >
                      <img
                        src={url}
                        alt=''
                        className='max-h-40 rounded border'
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

              {imageFiles.map((file, idx) => (
                <div key={`file-${idx}`} className='relative inline-block mr-2'>
                  <img
                    src={URL.createObjectURL(file)}
                    alt=''
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

              {editMode && (
                <div className='mt-3'>
                  <p className='text-sm font-bold text-gray-600 mb-1'>
                    Tải ảnh từ thiết bị
                  </p>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleImageUpload}
                    className='block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  />
                </div>
              )}
            </div>

            {/* Đáp án */}
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
                      onChange={e => {
                        const v = e.target.value;
                        setAnswers(prev => {
                          const n = [...prev];
                          n[idx] = v;
                          return n;
                        });
                      }}
                    />
                    <div className='mt-2'>
                      <InsertableMathField
                        onInsertLatex={latex => insertLatexToAnswer(idx, latex)}
                      />
                    </div>
                  </div>
                ))}
                <CommonButton
                  onClick={() => setAnswers(prev => [...prev, ''])}
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
                  {answers.map((ans, idx) => (
                    <li key={idx}>
                      <MathJax dynamic>
                        <div>
                          <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                          {ans}
                        </div>
                      </MathJax>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
