import { useState, useRef, useEffect } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualCreateQuestion from './ManualCreateQuestion';
import AutoCreateQuestion from './AutoCreateQuestion';
import { postQuestion } from '@/services/questionService';
import { toast } from 'react-toastify';
import { getTopic } from '@/services/topicService';

const UploadQuestion = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const manualQuestionFormRef = useRef(null);
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

  const levelMap = { NhậnBiết: 0, ThôngHiểu: 1, VậnDụng: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

  const isValidGuid = guid =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      guid
    );

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

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isValidGuid(question.topicId)) {
      toast.error('Chủ đề không hợp lệ. Vui lòng chọn lại.');
      return;
    }

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
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      toast.error('Lỗi thêm câu hỏi!');
    }
  };

  return (
    <section className='bg-gray-50 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <Breadcrumb />
      <div className='max-w-3xl mx-auto px-6 sm:px-12'>
        <div className='text-center max-w-md mx-auto mb-8'>
          <div className='text-blue-400 mb-3 text-4xl leading-none'>
            <i className='fas fa-graduation-cap'></i>
          </div>
          <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
            Tải Lên Câu Hỏi
          </h2>
        </div>

        {/* Tabs */}
        <div className='mb-4 border-b border-gray-200'>
          <ul
            className='flex flex-wrap -mb-px text-sm font-medium text-center'
            role='tablist'
          >
            <li className='mr-2' role='presentation'>
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'manual'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('manual')}
              >
                Thủ công
              </button>
            </li>
            <li className='mr-2' role='presentation'>
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'ai-generated'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('ai-generated')}
              >
                Tự động
              </button>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'manual' && (
            <ManualCreateQuestion
              ref={manualQuestionFormRef}
              question={question}
              setQuestion={setQuestion}
              topics={topics}
            />
          )}
          {activeTab === 'ai-generated' && <AutoCreateQuestion />}

          <PrimaryButton className='w-full mt-4' type='submit'>
            Tải lên
          </PrimaryButton>
        </form>

        <div className='mt-6 flex justify-end text-blue-400 text-3xl'>
          <i className='fas fa-globe-americas'></i>
        </div>
      </div>
    </section>
  );
};

export default UploadQuestion;
