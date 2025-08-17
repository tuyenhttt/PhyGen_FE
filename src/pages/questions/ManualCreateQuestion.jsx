import { useRef, useState, useEffect } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import InsertableMathField from '@/components/ui/InsertableMathField';
import CommonButton from '@/components/ui/CommonButton';
import { FaPlus } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import { getSubjectBooksByGradePath } from '@/services/subjectbooksService';
import { getChapterBySubjectBooks } from '@/services/chapterService';
import { getTopicsByChapter } from '@/services/topicService';

const hasText = v => (v ?? '').toString().trim().length > 0;

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

export default function ManualCreateQuestion({
  question,
  setQuestion,
  onImageUpload,
  imageFiles,
  setImageFiles,
}) {
  const textAreaRef = useRef(null);
  const answerRefs = useRef([]);
  const [answers, setAnswers] = useState(['']);

  // chọn theo cấp bậc
  const [grade, setGrade] = useState('');
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [bookId, setBookId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');

  const insertLatex = latex => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const { selectionStart = 0, selectionEnd = 0 } = ta;
    const val = question.content || '';
    const updated =
      val.slice(0, selectionStart) + latex + val.slice(selectionEnd);
    setQuestion(prev => ({ ...prev, content: updated }));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = selectionStart + latex.length;
      ta.focus();
    }, 0);
  };

  const insertLatexToAnswer = (idx, latex) => {
    const input = answerRefs.current[idx];
    if (!input) return;
    const { selectionStart = 0, selectionEnd = 0 } = input;
    const cur = answers[idx] || '';
    const updated =
      cur.slice(0, selectionStart) + latex + cur.slice(selectionEnd);
    setAnswers(prev => {
      const n = [...prev];
      n[idx] = updated;
      return n;
    });
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = selectionStart + latex.length;
      input.focus();
    }, 0);
  };

  // bind id sang payload
  useEffect(
    () => setQuestion(p => ({ ...p, subjectBookId: bookId || null })),
    [bookId]
  );
  useEffect(
    () => setQuestion(p => ({ ...p, chapterId: chapterId || null })),
    [chapterId]
  );
  useEffect(
    () => setQuestion(p => ({ ...p, topicId: topicId || null })),
    [topicId]
  );

  // đồng bộ answer1..N
  useEffect(() => {
    setQuestion(prev => {
      const n = { ...prev };
      answers.forEach((a, i) => (n[`answer${i + 1}`] = a));
      return n;
    });
  }, [answers, setQuestion]);

  const handleChange = (field, value) =>
    setQuestion(prev => ({ ...prev, [field]: value }));

  // Lấy sách theo lớp
  useEffect(() => {
    setBookId('');
    setChapterId('');
    setTopicId('');
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
        setQuestion(p => ({ ...p, grade: Number(grade) }));
      } catch (e) {
        console.error('Lỗi tải Sách theo lớp:', e);
        toast.error('Không thể tải danh sách Sách của lớp đã chọn.');
      }
    })();
  }, [grade, setQuestion]);

  // Lấy chương theo sách
  useEffect(() => {
    setChapterId('');
    setTopicId('');
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

  // Lấy bài theo chương
  useEffect(() => {
    setTopicId('');
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

  const removeImageUrl = idx => {
    const urls = (question.image || '')
      .split(/[;,]/)
      .map(u => u.trim())
      .filter(Boolean);
    urls.splice(idx, 1);
    setQuestion(prev => ({ ...prev, image: urls.join(';') }));
  };

  return (
    <div className='w-full max-w-4xl mx-auto space-y-5 text-gray-700'>
      <div className='text-sm text-gray-600 italic'>
        <span>
          Những trường có dấu {''}
          <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
          điền
        </span>
      </div>

      {/* Hàng 1: Lớp + Sách */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
        <div>
          <p className='text-[16px] font-bold mb-1'>
            Lớp <span className='text-red-600'>*</span>
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

        <div className='md:col-span-3'>
          <p className='text-[16px] font-bold mb-1'>Sách</p>
          <select
            value={bookId}
            onChange={e => setBookId(e.target.value)}
            className='w-full border rounded p-2'
          >
            <option value=''>
              {books.length ? 'Chọn sách' : 'Không có sách'}
            </option>
            {books.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.grade ? ` - Lớp ${b.grade}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hàng 2: Chương & Bài */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
        <div>
          <p className='text-[16px] font-bold mb-1'>Chương</p>
          <select
            value={chapterId}
            onChange={e => setChapterId(e.target.value)}
            className='w-full border rounded p-2'
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
        </div>

        <div>
          <p className='text-[16px] font-bold mb-1'>Bài </p>
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            className='w-full border rounded p-2'
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
        </div>
      </div>

      {/* Mức độ & Loại */}
      <div className='flex flex-col sm:flex-row gap-6'>
        <div className='w-full sm:w-1/2'>
          <p className='text-[16px] font-bold mb-1'>
            Mức độ <span className='text-red-600'>*</span>
          </p>
          <select
            value={question.levelName || ''}
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
          <p className='text-[16px] font-bold mb-1'>
            Loại <span className='text-red-600'>*</span>
          </p>
          <select
            value={question.typeName || ''}
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
        <label className='text-[16px] font-bold mb-1 block'>
          Nội dung câu hỏi <span className='text-red-600'>*</span>
        </label>
        <textarea
          ref={textAreaRef}
          rows={5}
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          value={question.content || ''}
          onChange={e => handleChange('content', e.target.value)}
          placeholder='Nhập nội dung. Có công thức? Soạn ở dưới rồi nhấn "Chèn công thức".'
        />
        <div className='mt-4'>
          <InsertableMathField onInsertLatex={insertLatex} />
        </div>

        <label className='text-[16px] font-bold mb-1 block mt-5'>
          Xem trước
        </label>
        <div className='mt-2 p-4 border rounded bg-gray-50'>
          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
            <MathJax dynamic>
              <div className='whitespace-pre-line text-base text-gray-800'>
                {question.content || ''}
              </div>
            </MathJax>
          </MathJaxContext>
        </div>
      </div>

      {/* Ảnh */}
      <div className='space-y-4'>
        <label className='text-[16px] font-bold mb-1 block'>Hình ảnh</label>
        <textarea
          rows={2}
          className='w-full rounded border px-3 py-2 text-sm'
          placeholder='URL ảnh, phân cách bằng phẩy hoặc chấm phẩy'
          value={question.image || ''}
          onChange={e => handleChange('image', e.target.value)}
        />
        <div className='flex items-center gap-4 my-2'>
          <div className='flex-grow border-t border-dashed' />
          <span className='text-sm text-gray-400'>Hoặc</span>
          <div className='flex-grow border-t border-dashed' />
        </div>
        <label className='text-[16px] font-bold mb-1 block'>
          Chọn ảnh từ máy của bạn
        </label>
        <input
          type='file'
          accept='image/*'
          multiple
          onChange={onImageUpload}
          className='block w-full text-sm border rounded px-3 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-700'
        />
      </div>

      {/* preview URL */}
      {hasText(question.image) &&
        question.image
          .split(/[;,]/)
          .map(u => u.trim())
          .filter(Boolean)
          .map((url, i) => (
            <div key={`url-${i}`} className='relative inline-block mr-2 mb-2'>
              <img src={url} alt='' className='max-h-40 rounded border' />
              <button
                type='button'
                onClick={() => removeImageUrl(i)}
                className='absolute top-0 right-0 bg-white border rounded-full p-1 text-red-500 hover:bg-red-500 hover:text-white text-xs'
                title='Xoá ảnh URL'
              >
                ✖
              </button>
            </div>
          ))}

      {/* preview file */}
      {imageFiles.map((f, i) => (
        <div key={`file-${i}`} className='relative inline-block mr-2 mb-2'>
          <img
            src={URL.createObjectURL(f)}
            alt=''
            className='max-h-40 rounded border'
          />
          <button
            type='button'
            onClick={() => {
              const next = [...imageFiles];
              next.splice(i, 1);
              setImageFiles(next);
            }}
            className='absolute top-0 right-0 bg-white border rounded-full p-1 text-red-500 hover:bg-red-500 hover:text-white text-xs'
            title='Xoá ảnh'
          >
            <MdClear size={18} />
          </button>
        </div>
      ))}

      {/* Đáp án */}
      <div className='space-y-4'>
        <label className='block text-[16px] font-bold'>Đáp án</label>
        {answers.map((ans, idx) => (
          <div key={idx}>
            <input
              ref={el => (answerRefs.current[idx] = el)}
              type='text'
              value={ans}
              onChange={e => {
                const v = e.target.value;
                setAnswers(prev => {
                  const n = [...prev];
                  n[idx] = v;
                  return n;
                });
              }}
              className='w-full rounded border px-3 py-2 text-sm'
              placeholder={`Đáp án ${idx + 1}`}
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
          className='flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium'
        >
          <FaPlus /> Thêm đáp án
        </CommonButton>
      </div>
    </div>
  );
}
