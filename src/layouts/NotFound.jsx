import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50 px-6 py-12'>
      <div className='text-center'>
        <h1 className='text-6xl font-extrabold text-indigo-600 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
          Không tìm thấy trang
        </h2>
        <p className='text-gray-600 mb-6'>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to='/'
          className='inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition'
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
