import Breadcrumb from '@/components/layouts/Breadcrumb';
import PrimaryButton from '@/components/ui/PrimaryButton';

const UploadMatrix = () => {
  return (
    <>
      {/* Breadcrumb */}
      <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
        <Breadcrumb />
        {/* Form Section */}
        <div className='max-w-3xl mx-auto px-6 sm:px-12'>
          <div className='text-center max-w-md mx-auto mb-8'>
            <div className='text-blue-400 mb-3 text-4xl leading-none'>
              <i className='fas fa-graduation-cap'></i>
            </div>
            <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
              Tải Lên Ma Trận
            </h2>
          </div>
          <form className='space-y-4'>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='matrixTitle'
              >
                Tiêu đề
              </label>
              <input
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='matrixTitle'
                name='matrixTitle'
                placeholder='Tiêu đề ma trận'
                type='text'
              />
            </div>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='matrix'
              >
                Ma trận
              </label>
              <select
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='matrix'
                name='matrix'
              >
                <option>Chọn ma trận</option>
                <option>Ma trận 1</option>
                <option>Ma trận 2</option>
                <option>Ma trận 3</option>
              </select>
            </div>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='describe'
              >
                Mô tả
              </label>
              <textarea
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='describe'
                name='describe'
                placeholder='Mô tả'
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
    </>
  );
};

export default UploadMatrix;
