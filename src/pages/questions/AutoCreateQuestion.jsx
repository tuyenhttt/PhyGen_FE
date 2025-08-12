import { useState } from 'react';
import CommonButton from '@/components/ui/CommonButton';
import { toast } from 'react-toastify';
import { checkFile, extractFromFile } from '@/services/questionService';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const AutoCreateQuestion = ({
  setQuestionList
}) => {
  const [grade, setGrade] = useState('');
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const typeMap = {
    0: 'Nhiều đáp án',
    1: 'Đúng/Sai',
    2: 'Câu trả lời ngắn',
    3: 'Tự luận',
  };

  const levelMap = {
    0: 'Nhận biết',
    1: 'Thông hiểu',
    2: 'Vận dụng',
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setQuestions([]);
  };

  const handleCheckFile = async () => {
    if (!grade) {
      toast.error('Vui lòng chọn khối lớp!');
      return;
    }
    if (!file) {
      toast.error('Vui lòng chọn file Word!');
      return;
    }

    try {
      setLoading(true);

      const resCheck = await checkFile(file, grade);
      if (!resCheck.data?.isPhysicsExam) {
        toast.error('File không phải đề kiểm tra vật lý!');
        return;
      }

      toast.success('File hợp lệ! Đang trích xuất câu hỏi...');
      const resExtract = await extractFromFile(file, grade);
      const list = resExtract.data || [];
      setQuestions(list);
      setQuestionList(list);

      if (list.length === 0) {
        toast.warn('Không tìm thấy câu hỏi trong file!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kiểm tra hoặc trích xuất file!');
    } finally {
      setLoading(false);
    }
  };

  const answerLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className='w-full max-w-4xl mx-auto space-y-5 text-gray-700'>
      {/* Chọn lớp */}
      <div className='w-full sm:w-1/4'>
        <p className='block text-sm font-bold mb-1'>
          Khối lớp : <span className='text-red-600'>*</span>
        </p>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className='w-full border rounded p-2'
        >
          <option value=''>Chọn lớp</option>
          <option value='10'>Lớp 10</option>
          <option value='11'>Lớp 11</option>
          <option value='12'>Lớp 12</option>
        </select>
      </div>

      {/* Upload file Word */}
      <div>
        <p className='block text-sm font-bold mb-1'>
          Chọn file Word đề thi vật lý: <span className='text-red-600'>*</span>
        </p>
        <input
          type='file'
          accept='.doc,.docx'
          onChange={handleFileChange}
          className='block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
        />
      </div>

      {/* Nút kiểm tra file */}
      <CommonButton
        onClick={handleCheckFile}
        disabled={loading}
        className='px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium'
      >
        {loading ? 'Đang xử lý...' : 'Kiểm tra file & Trích xuất'}
      </CommonButton>

      {/* Preview câu hỏi */}
      {questions.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-bold mb-3'>Danh sách câu hỏi:</h3>
          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
            <ul className='space-y-4'>
              {questions.map((q, idx) => (
                <li key={idx} className='p-4 border rounded bg-gray-50'>
                  {/* Thông tin thêm */}
                  <div className='mt-2 text-sm text-gray-500'>
                    <span>Chủ đề: {q.topicName || '—'}</span> |{' '}
                    <span>Loại: {typeMap[q.type] || q.type}</span> |{' '}
                    <span>Mức độ: {levelMap[q.level] || q.level}</span> | <span>Lớp: {q.grade}</span>
                  </div>
                  <p className='font-semibold text-indigo-600'>Câu {idx + 1}:</p>
                  <MathJax dynamic>
                    <div className='whitespace-pre-line'>{q.content}</div>
                  </MathJax>

                  {/* Hiện ảnh nếu có */}
                  {q.mediaBase64 && (
                    <img
                      src={`data:image/png;base64,${q.mediaBase64}`}
                      alt={`Ảnh câu ${idx + 1}`}
                      className='mt-2 max-h-40 rounded border'
                    />
                  )}

                  {/* Hiện đáp án nếu có */}
                  {Object.keys(q)
                    .filter(k => k.startsWith('answer') && q[k])
                    .length > 0 && (
                      <div className='mt-2'>
                        <p className='font-medium text-gray-700'>Đáp án:</p>
                        <ul className='space-y-1 text-sm'>
                          {Object.keys(q)
                            .filter(k => k.startsWith('answer') && q[k])
                            .map((k, i) => (
                              <li key={i} className='flex items-start gap-2'>
                                <span className='font-bold'>{answerLabels[i]}.</span>
                                <MathJax dynamic>{q[k]}</MathJax>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </li>
              ))}
            </ul>
          </MathJaxContext>
        </div>
      )}
    </div>
  );
};

export default AutoCreateQuestion;