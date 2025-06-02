import Breadcrumb from '@/components/layouts/Breadcrumb';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import PrimaryButton from '@/components/ui/PrimaryButton';

const UploadQuestion = () => {
  return (
    <>
      <Header />

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
          <form className='space-y-4'>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='content'
              >
                Nội dung
              </label>
              <input
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='content'
                name='content'
                placeholder='Nhập nội dung câu hỏi'
                type='text'
              />
            </div>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='chapter'
              >
                Thuộc chương
              </label>
              <select
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='chapter'
                name='chapter'
              >
                <option>Chọn chương</option>
                <option>Chương 1</option>
                <option>Chương 2</option>
                <option>Chương 3</option>
              </select>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700 mb-1'
                  htmlFor='type'
                >
                  Loại
                </label>
                <select
                  className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                  id='type'
                  name='type'
                >
                  <option>Chọn Loại</option>
                  <option>Trắc nghiệm</option>
                  <option>Tự luận</option>
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
                >
                  <option>Chọn cấp độ câu hỏi</option>
                  <option>Nhận biết</option>
                  <option>Thông hiểu</option>
                  <option>Vận dụng</option>
                  <option>Vận dụng cao</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='answer'
              >
                Đáp án
              </label>
              <textarea
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='answer'
                name='answer'
                placeholder='Đáp án'
                rows='4'
              ></textarea>
            </div>
            <PrimaryButton
              className='w-full bg-blue-900 text-white text-sm font-semibold py-2 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600'
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

      <Footer />
    </>
  );
};

export default UploadQuestion;
