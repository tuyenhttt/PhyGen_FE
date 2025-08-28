import { useEffect, useState, useRef } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import AutoCreateQuestion from '@/pages/admin/exams/AutoCreateQuestion';
import { getTopic } from '@/services/topicService';
import { postQuestion, postQuestionMedia } from '@/services/questionService';
import { supabase } from '@/supabase/supabaseClient';

const levelMap = { Easy: 0, Medium: 1, Hard: 2 };
const typeMap = { MultipleChoice: 0, TrueFalse: 1, ShortAnswer: 2, Essay: 3 };

export default function AutoAddQuestionModal({ onClose, onSave }) {
  const [questionList, setQuestionList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTopic();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setTopics(list);
      } catch (e) {
        console.error('Lỗi khi lấy chủ đề:', e);
        toast.error('Không thể tải danh sách chủ đề');
      }
    })();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setIsDirty(true);
  }, [questionList]);

  const topicIdByName = name => {
    if (!name) return null;
    const found = topics?.find(t => t?.name?.trim() === name?.trim());
    return found?.id ?? null;
  };

  const uploadImageToSupabase = async file => {
    const fileExt = file?.name?.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;
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

  const handleSubmitAll = async () => {
    if (!Array.isArray(questionList) || questionList.length === 0) {
      toast.info('Chưa có câu hỏi nào để tải lên.');
      return;
    }

    try {
      for (const q of questionList) {
        const level =
          typeof q.level === 'number'
            ? q.level
            : levelMap[q.levelName] ?? levelMap[q.level] ?? 0;

        const type =
          typeof q.type === 'number'
            ? q.type
            : typeMap[q.typeName] ?? typeMap[q.type] ?? 0;

        const payload = {
          topicId: q.topicId || topicIdByName(q.topicName || q.topic),
          content: q.content?.toString() || '',
          levelName: ['Easy', 'Medium', 'Hard'][level] || 'Easy',
          typeName:
            ['MultipleChoice', 'TrueFalse', 'ShortAnswer', 'Essay'][type] ||
            'MultipleChoice',
          answer1: q.answer1 || q.answers?.[0] || '',
          answer2: q.answer2 || q.answers?.[1] || '',
          answer3: q.answer3 || q.answers?.[2] || '',
          answer4: q.answer4 || q.answers?.[3] || '',
          answer5: q.answer5 || q.answers?.[4] || '',
          answer6: q.answer6 || q.answers?.[5] || '',
          grade: q.grade ? Number(q.grade) : undefined,
          status: 1,
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

        // Gọi API tạo câu hỏi
        const created = await postQuestion(payload);

        if (imageUrls.length > 0) {
          for (const url of imageUrls) {
            await postQuestionMedia({
              questionId: created?.data?.data?.id,
              mediaType: 'Image',
              url: url,
            });
          }
        }
      }

      toast.success('Tải lên danh sách câu hỏi hoàn tất!');
      setIsDirty(false);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi tải lên câu hỏi tự động.');
    }
  };

  const requestClose = () => {
    if (isDirty) {
      setShowConfirmLeave(true);
      return;
    }
    onClose?.();
  };

  const confirmLeave = () => {
    setShowConfirmLeave(false);
    onClose?.();
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3'>
      <div className='w-full max-w-5xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-semibold'>Thêm câu hỏi tự động</h3>
          <button
            onClick={requestClose}
            className=' top-5 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold'
          >
            &times;
          </button>
        </div>

        {/* Khối trích xuất câu hỏi từ file (giống User) */}
        <AutoCreateQuestion setQuestionList={setQuestionList} />

        <div className='mt-4 flex justify-end gap-2'>
          <button
            onClick={requestClose}
            className='border border-gray-300 text-gray-700 hover:bg-gray-100 px-5 py-2 rounded-lg'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={handleSubmitAll}
            className='bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg'
          >
            Tải lên tất cả
          </PrimaryButton>
        </div>

        {/* Confirm rời khi có thay đổi */}
        <ConfirmModal
          visible={showConfirmLeave}
          title='Rời khỏi mà không lưu?'
          onClose={() => setShowConfirmLeave(false)}
        >
          <p className='mb-6 text-gray-700'>
            Bạn đã có thay đổi chưa lưu. Bạn chắc chắn muốn đóng cửa sổ và bỏ
            các thay đổi?
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
    </div>
  );
}
