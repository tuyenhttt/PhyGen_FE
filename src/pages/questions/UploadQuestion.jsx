import { useState, useRef, useEffect } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualCreateQuestion from './ManualCreateQuestion';
import AutoCreateQuestion from './AutoCreateQuestion';
import { postQuestion, postQuestionMedia } from '@/services/questionService';
import { toast } from 'react-toastify';
import { getTopic } from '@/services/topicService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabaseClient';

const UploadQuestion = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const manualQuestionFormRef = useRef(null);
  const [question, setQuestion] = useState({
    topicId: '',
    content: '',
    levelName: '',
    typeName: '',
    image: '',
    answer1: '',
    answer2: '',
    answer3: '',
    answer4: '',
    answer5: '',
    answer6: '',
  });
  const [topics, setTopics] = useState([]);

  const navigate = useNavigate();

  const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

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

    if (!question.content?.trim()) {
      toast.error('Nội dung câu hỏi không được để trống');
      return;
    }

    if (!question.levelName || !question.typeName) {
      toast.error('Vui lòng chọn mức độ và loại câu hỏi!');
      return;
    }

    if (!question.grade || isNaN(Number(question.grade))) {
      toast.error('Vui lòng chọn khối lớp!');
      return;
    }

    const typeValue = typeMap[question.typeName];
    if (typeValue === undefined) {
      toast.error('Loại câu hỏi không hợp lệ!');
      return;
    }

    const payload = {
      topicId: question.topicId || null,
      content: question.content,
      level: levelMap[question.levelName],
      type: typeMap[question.typeName],
      grade: Number(question.grade),
    };

    if (question.image?.trim()) {
      payload.image = question.image.trim();
    }

    [1, 2, 3, 4, 5, 6].forEach(i => {
      const key = `answer${i}`;
      const val = question[key];
      if (val?.trim()) {
        payload[key] = val.trim();
      }
    });

    if (typeValue === 3 && !payload.answer1) {
      payload.answer1 = '';
    }

    try {
      const response = await postQuestion(payload);
      const createdQuestion = response?.data?.data;

      if (!createdQuestion?.id) throw new Error('Không có ID câu hỏi trả về!');

      const imageUrls = (question.image || '')
        .split(/[;,]/)
        .map(url => url.trim())
        .filter(Boolean);

      for (const url of imageUrls) {
        await postQuestionMedia({
          questionId: createdQuestion.id,
          mediaType: 'Image',
          url,
        });
      }

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
      navigate(-1);
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
      if (err.response?.data) {
        console.log('Lỗi chi tiết từ server:', err.response.data);
      }

      toast.error('Lỗi thêm câu hỏi!');
    }
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
              onImageUpload={handleImageUpload}
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
