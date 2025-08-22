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
  const [questionList, setQuestionList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
  const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };
  const topicMap = topicName => {
    const foundTopic = topics?.find(t => t?.name.trim() === topicName.trim());
    return foundTopic ? foundTopic?.id : null;
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await getTopic();
        const list = Array.isArray(response?.data)
          ? response?.data
          : Array.isArray(response?.data?.data)
          ? response?.data?.data
          : [];
        setTopics(list);
      } catch (err) {
        console.error('Lỗi khi lấy chủ đề:', err);
        toast.error('Không thể tải danh sách chủ đề');
      }
    })();
  }, []);

  const uploadImageToSupabase = async file => {
    const fileExt = file?.name.split('.').pop();
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
    const files = Array.from(e?.target?.files);
    setImageFiles(prev => [...prev, ...files]);
    toast.success('Chọn ảnh thành công! Ảnh sẽ được tải lên khi bạn submit.');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (activeTab === 'manual') {
      if (!question?.content?.trim()) {
        toast.error('Nội dung câu hỏi không được để trống');
        return;
      }

      if (!question?.levelName || !question?.typeName) {
        toast.error('Vui lòng chọn mức độ và loại câu hỏi!');
        return;
      }

      if (!question?.grade || isNaN(Number(question?.grade))) {
        toast.error('Vui lòng chọn khối lớp!');
        return;
      }

      const typeValue = typeMap[question?.typeName];
      if (typeValue === undefined) {
        toast.error('Loại câu hỏi không hợp lệ!');
        return;
      }

      try {
        setLoading(true);
        let imageUrls = [];
        if (imageFiles?.length > 0) {
          imageUrls = await Promise.all(
            imageFiles.map(file => uploadImageToSupabase(file))
          );
        }

        const payload = {
          topicId: question?.topicId || null,
          content: question?.content,
          level: levelMap[question?.levelName],
          type: typeMap[question?.typeName],
          grade: Number(question?.grade),
        };

        if (imageUrls.length > 0) {
          payload.image = imageUrls.join(';');
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

        const response = await postQuestion(payload);
        const createdQuestion = response?.data?.data;

        if (!createdQuestion?.id)
          throw new Error('Không có ID câu hỏi trả về!');

        for (const url of imageUrls) {
          await postQuestionMedia({
            questionId: createdQuestion?.id,
            mediaType: 'Image',
            url,
          });
        }

        toast.success('Thêm câu hỏi thành công');

        setQuestion({
          topicId: '',
          content: '',
          levelName: 'Easy',
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
        navigate(-1);
      } catch (err) {
        console.error('Lỗi khi thêm câu hỏi:', err);
        toast.error('Lỗi thêm câu hỏi!');
      } finally {
        setLoading(false);
      }
    } else {
      if (!questionList || questionList?.length === 0) {
        toast.error('Không có câu hỏi nào để tải lên!');
        return;
      }
      try {
        setLoading(true);
        for (const q of questionList) {
          const payload = {
            topicId: topicMap(q?.topicName),
            content: q?.content,
            level: q?.level,
            type: q?.type,
            grade: Number(q?.grade),
            answer1: q?.answer1,
            answer2: q?.answer2,
            answer3: q?.answer3,
            answer4: q?.answer4,
            answer5: q?.answer5,
            answer6: q?.answer6,
            status: 1
          };

          let imageUrls = [];
          if (Array.isArray(q.mediaUrls) && q.mediaUrls.length > 0) {
            imageUrls = await Promise.all(
              q.mediaUrls
                .filter(file => file && typeof file !== 'string' && file.name) // chỉ upload file object
                .map(file => uploadImageToSupabase(file))
            );
            // Nếu có các url string sẵn thì giữ lại
            const urlStrings = q.mediaUrls.filter(url => typeof url === 'string');
            imageUrls = [...urlStrings, ...imageUrls];
          }

          const response = await postQuestion(payload);
          const createdQuestion = response?.data?.data;

          if (!createdQuestion?.id) {
            throw new Error('Không có ID câu hỏi trả về hoặc đã tồn tại!');
          }

          if (imageUrls.length > 0) {
            for (const url of imageUrls) {
              await postQuestionMedia({
                questionId: createdQuestion.id,
                mediaType: 'Image',
                url: url,
              });
            }
          }
        }

        toast.success('Tải lên tất cả câu hỏi thành công!');
        navigate(-1);
      } catch (err) {
        console.error('Lỗi khi tải lên câu hỏi:', err);
        toast.error('Lỗi tải lên câu hỏi!');
      } finally {
        setLoading(false);
      }
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

        <div className='mb-4 border-b border-gray-200'>
          <ul
            className='flex flex-wrap -mb-px text-sm font-medium text-center'
            role='tablist'
          >
            <li className='mr-2' role='presentation'>
              <button
                className={`inline-block p-4 border-b-2 text-[16px] rounded-t-lg ${activeTab === 'manual'
                  ? 'border-indigo-600 text-[16px] text-indigo-600'
                  : 'border-transparent text-[16px] text-gray-500 hover:text-gray-600 hover:border-gray-300'
                  }`}
                onClick={() => setActiveTab('manual')}
              >
                Thủ công
              </button>
            </li>
            <li className='mr-2' role='presentation'>
              <button
                className={`inline-block text-[16px] p-4 border-b-2 rounded-t-lg ${activeTab === 'ai-generated'
                  ? 'border-indigo-600 text-[16px] text-indigo-600'
                  : 'border-transparent text-[16px] text-gray-500 hover:text-gray-600 hover:border-gray-300'
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
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          )}
          {activeTab === 'ai-generated' && (
            <AutoCreateQuestion setQuestionList={setQuestionList} />
          )}

          <PrimaryButton className='w-full mt-4'
            type='submit'
            disabled={loading}>
            {loading ? 'Đang tải lên...' : 'Tải lên'}
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
