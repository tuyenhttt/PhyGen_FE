import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextInput from '@/components/ui/TextInput';
import { getTopic } from '@/services/topicService';

const ManualCreateQuestion = forwardRef(({}, ref) => {
  const [content, setContent] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [level, setLevel] = useState('');
  const [answerOptions, setAnswerOptions] = useState([
    { id: 1, text: '', isCorrect: false },
  ]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [topicSearchInput, setTopicSearchInput] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);

  const topicRef = useRef(null);
  useImperativeHandle(ref, () => ({
    getFormData: () => {
      let answersData = [];
      let correctAnswerIndexes = [];

      if (questionType === '0' || questionType === '1') {
        answersData = answerOptions.map((option, index) => {
          if (option.isCorrect) {
            correctAnswerIndexes.push(`answer${option.id}`);
          }
          return option.text;
        });
      }

      const data = {
        topicId: selectedTopicId,
        content: content,
        level: parseInt(level),
        type: parseInt(questionType),
      };

      answersData.forEach((answerText, index) => {
        data[`answer${index + 1}`] = answerText;
      });

      if (questionType === '0' || questionType === '1') {
        const correctOption = answerOptions.find(option => option.isCorrect);
        if (correctOption) {
          data.correctAnswer = correctOption.text;
        } else {
          data.correctAnswer = '';
        }
      } else {
        data.correctAnswer = '';
      }

      return data;
    },
    getImageFile: () => selectedImage,
    validate: () => {
      if (!content || !selectedTopicId || !questionType || !level) {
        alert(
          'Vui lòng điền đầy đủ thông tin câu hỏi (Nội dung, Chủ đề, Loại, Cấp độ).'
        );
        return false;
      }
      if (
        (questionType === '0' || questionType === '1') &&
        answerOptions.length === 0
      ) {
        alert('Vui lòng thêm ít nhất một đáp án cho câu hỏi trắc nghiệm.');
        return false;
      }
      const correctAnswers = answerOptions.filter(option => option.isCorrect);
      if (
        (questionType === '0' || questionType === '1') &&
        correctAnswers.length === 0
      ) {
        alert('Vui lòng chọn ít nhất một đáp án đúng.');
        return false;
      }
      return true;
    },
    resetForm: () => {
      setContent('');
      setQuestionType('');
      setLevel('');
      setAnswerOptions([{ id: 1, text: '', isCorrect: false }]);
      setSelectedImage(null);
      setImagePreviewUrl('');
      setTopicSearchInput('');
      setSelectedTopicId('');
      setShowTopicSuggestions(false);
    },
  }));

  useEffect(() => {
    const fetchTopic = async () => {
      setLoadingTopic(true);
      try {
        const response = await getTopic();
        if (
          response.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const validTopics = response.data.data.filter(
            t => Object.keys(t).length > 0 && t.id && t.name
          );
          setTopics(validTopics);
          setFilteredTopics(validTopics);
        } else {
          console.warn('Dữ liệu chủ đề trả về rỗng hoặc không đúng định dạng.');
          setTopics([]);
          setFilteredTopics([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải chủ đề:', error);
        setTopics([]);
        setFilteredTopics([]);
      } finally {
        setLoadingTopic(false);
      }
    };

    fetchTopic();
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (topicRef.current && !topicRef.current.contains(event.target)) {
        setShowTopicSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [topicRef]);

  const handleAddAnswerOption = () => {
    if (answerOptions.length < 6) {
      setAnswerOptions([
        ...answerOptions,
        { id: answerOptions.length + 1, text: '', isCorrect: false },
      ]);
    }
  };

  const handleAnswerTextChange = (id, value) => {
    setAnswerOptions(
      answerOptions.map(option =>
        option.id === id ? { ...option, text: value } : option
      )
    );
  };

  const handleCorrectAnswerChange = id => {
    setAnswerOptions(
      answerOptions.map(option => ({
        ...option,
        isCorrect: option.id === id ? !option.isCorrect : false,
      }))
    );
  };

  const handleQuestionTypeChange = e => {
    setQuestionType(e.target.value);
    if (e.target.value === '0' || e.target.value === '1') {
      setAnswerOptions([{ id: 1, text: '', isCorrect: false }]);
    }
  };

  const handleImageChange = event => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(null);
      setSelectedImage(null);
      setImagePreviewUrl('');
    }
  };

  const handleTopicInputChange = e => {
    const input = e.target.value;
    setTopicSearchInput(input);
    if (input.length > 0) {
      const filtered = topics.filter(topic =>
        topic.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredTopics(filtered);
      setShowTopicSuggestions(true);
    } else {
      setFilteredTopics(topics);
      setShowTopicSuggestions(false);
    }
    setSelectedTopicId('');
  };

  const handleTopicSelect = topic => {
    setTopicSearchInput(topic.name);
    setSelectedTopicId(topic.id);
    setShowTopicSuggestions(false);
  };

  const handleTopicInputFocus = () => {
    setShowTopicSuggestions(true);
    setFilteredTopics(topics);
  };

  return (
    <div className='space-y-4'>
      <div>
        <TextInput
          id='content'
          label='Nội dung'
          type='text'
          placeholder='Nhập nội dung câu hỏi'
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div className='relative' ref={topicRef}>
        <label
          className='block text-sm font-medium text-gray-700 mb-1'
          htmlFor='topic'
        >
          Chủ đề
        </label>
        <TextInput
          id='topic'
          name='topic'
          type='text'
          placeholder='Nhập để tìm kiếm chủ đề'
          value={topicSearchInput}
          onChange={handleTopicInputChange}
          onFocus={handleTopicInputFocus}
          autoComplete='off'
          disabled={loadingTopic}
        />
        {showTopicSuggestions && !loadingTopic && filteredTopics.length > 0 && (
          <div className='absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg'>
            {filteredTopics.map(topic => (
              <div
                key={topic.id}
                className='px-3 py-2 cursor-pointer hover:bg-gray-100'
                onClick={() => handleTopicSelect(topic)}
              >
                {topic.name}
              </div>
            ))}
          </div>
        )}
        {showTopicSuggestions &&
          !loadingTopic &&
          filteredTopics.length === 0 &&
          topicSearchInput.length > 0 && (
            <div className='absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 px-3 py-2 text-gray-500 shadow-lg'>
              Không tìm thấy chủ đề nào.
            </div>
          )}
        {loadingTopic && (
          <div className='absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 px-3 py-2 text-gray-500 shadow-lg'>
            Đang tải chủ đề...
          </div>
        )}
      </div>
      <div>
        <label
          className='block text-xs font-medium text-gray-700 mb-1'
          htmlFor='type'
        >
          Loại câu hỏi
        </label>
        <select
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          id='type'
          name='type'
          value={questionType}
          onChange={handleQuestionTypeChange}
        >
          <option value=''>Chọn loại câu hỏi</option>
          <option value='0'>Trắc nghiệm nhiều đáp án</option>
          <option value='1'>Trắc nghiệm đúng/sai</option>
          <option value='2'>Câu hỏi trả lời ngắn</option>
          <option value='3'>Tự luận</option>
        </select>
      </div>
      <div>
        <label
          className='block text-xs font-medium text-gray-700 mb-1'
          htmlFor='level'
        >
          Cấp độ
        </label>
        <select
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          id='level'
          name='level'
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          <option value=''>Chọn cấp độ câu hỏi</option>
          <option value='0'>Nhận biết</option>
          <option value='1'>Thông hiểu</option>
          <option value='2'>Vận dụng</option>
        </select>
      </div>

      {(questionType === '0' || questionType === '1') && (
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>
            Đáp án
          </label>
          {answerOptions.map(option => (
            <div key={option.id} className='flex items-center space-x-2 mb-2'>
              <input
                type='radio'
                name='correctAnswer'
                checked={option.isCorrect}
                onChange={() => handleCorrectAnswerChange(option.id)}
                className='form-radio text-blue-600'
              />
              <input
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                type='text'
                placeholder={`Đáp án ${option.id}`}
                value={option.text}
                onChange={e =>
                  handleAnswerTextChange(option.id, e.target.value)
                }
              />
            </div>
          ))}
          <PrimaryButton
            type='button'
            onClick={handleAddAnswerOption}
            disabled={answerOptions.length >= 6}
            className='mt-2 bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300'
          >
            Thêm đáp án
          </PrimaryButton>
        </div>
      )}

      <div>
        <label
          className='block text-xs font-medium text-gray-700 mb-1'
          htmlFor='image'
        >
          Tải lên hình ảnh
        </label>
        <input
          className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
          id='image'
          name='image'
          type='file'
          accept='image/*'
          onChange={handleImageChange}
        />
      </div>

      {imagePreviewUrl && (
        <div className='mt-4'>
          <img
            src={imagePreviewUrl}
            alt='Xem trước hình ảnh'
            className='max-w-full h-auto rounded'
          />
        </div>
      )}
    </div>
  );
});

export default ManualCreateQuestion;
