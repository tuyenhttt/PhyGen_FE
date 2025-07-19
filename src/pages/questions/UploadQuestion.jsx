import { useState, useRef } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';
import ManualCreateQuestion from './ManualCreateQuestion';
import AutoCreateQuestion from './AutoCreateQuestion';
import { postQuestion } from '@/services/questionService';
import { toast } from 'react-toastify';

const UploadQuestion = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const manualQuestionFormRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'manual') {
      const isValid = manualQuestionFormRef.current?.validate();

      if (!isValid) {
        return;
      }

      const formData = manualQuestionFormRef.current?.getFormData();
      const imageFile = manualQuestionFormRef.current?.getImageFile();

      if (formData) {
        try {
          const response = await postQuestion(formData);
          console.log('response', response);
          toast.success('Tạo câu hỏi thành công!');
          manualQuestionFormRef.current?.resetForm();
        } catch (error) {
          console.error('Lỗi khi tạo câu hỏi:', error);
          toast.error('Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại.');
        }
      } else {
        toast.error('Không thể lấy dữ liệu form. Vui lòng thử lại.');
      }
    } else {
      console.log('Submit AI Generated Form (under development)');
      toast.warning('Chức năng tạo câu hỏi tự động chưa được triển khai.');
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <section className='bg-gray-50 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
        <Breadcrumb />
        {/* Form Section */}
        <div className='max-w-3xl mx-auto px-6 sm:px-12'>
          <div className='text-center max-w-md mx-auto mb-8'>
            <div className='text-blue-400 mb-3 text-4xl leading-none'>
              <i className='fas fa-graduation-cap'></i>
            </div>
            <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
              Tải Lên Câu Hỏi
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className='mb-4 border-b border-gray-200'>
            <ul className='flex flex-wrap -mb-px text-sm font-medium text-center' role='tablist'>
              <li className='mr-2' role='presentation'>
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'manual'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  id='manual-upload-tab'
                  type='button'
                  role='tab'
                  aria-controls='manual-upload'
                  aria-selected={activeTab === 'manual'}
                  onClick={() => setActiveTab('manual')}
                >
                  Thủ công
                </button>
              </li>
              <li className='mr-2' role='presentation'>
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'ai-generated'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                    }`}
                  id='ai-generated-tab'
                  type='button'
                  role='tab'
                  aria-controls='ai-generated'
                  aria-selected={activeTab === 'ai-generated'}
                  onClick={() => setActiveTab('ai-generated')}
                >
                  Tự động
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit}>
            {activeTab === 'manual' && <ManualCreateQuestion ref={manualQuestionFormRef} />}
            {activeTab === 'ai-generated' && <AutoCreateQuestion />}

            <PrimaryButton
              className='w-full mt-4'
              type='submit'
            >
              Tải lên
            </PrimaryButton>
          </form>

          <div className='mt-6 flex justify-end text-blue-400 text-3xl'>
            <i className='fas fa-globe-americas'></i>
          </div>
        </div>
      </section>
    </>
  );
};

export default UploadQuestion;