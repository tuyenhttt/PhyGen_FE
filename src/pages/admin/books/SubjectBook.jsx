import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubjectBooks, getSubject } from '@/services/subjectbooksService';
import { PiBookOpenFill } from 'react-icons/pi';

const colors = [
  'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
  'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
  'bg-[#FEF9C3] text-[#A16207] border-[#FDE68A]',
  'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]',
  'bg-[#EDE9FE] text-[#6B21A8] border-[#DDD6FE]',
  'bg-[#F0F9FF] text-[#0C4A6E] border-[#DBEAFE]',
  'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]',
  'bg-[#ECFDF5] text-[#047857] border-[#D1FAE5]',
];

const SubjectBook = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjectBook = async () => {
      try {
        const subjectRes = await getSubject();
        const subjectList = subjectRes.data?.data || [];
        const firstSubjectId = subjectList[0]?.id;

        if (!firstSubjectId) {
          setIsLoading(false);
          return;
        }

        const res = await getAllSubjectBooks(firstSubjectId);
        const bookList = res.data?.data?.data || [];
        setBooks(bookList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sách:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectBook();
  }, []);

  const handleNavigateBooks = bookId => {
    navigate(`/admin/subject-book/${bookId}`);
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Các sách Vật lý
      </h2>

      <div className='px-2 py-4'>
        {isLoading ? (
          <p className='text-center text-gray-500'>Đang tải sách...</p>
        ) : hasError ? (
          <p className='text-center text-red-600'>
            Đã xảy ra lỗi khi tải sách.
          </p>
        ) : books.length === 0 ? (
          <p className='text-center text-gray-500'>
            Không có sách để hiển thị.
          </p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
            {books.map((book, index) => (
              <div
                key={book.id}
                onClick={() => handleNavigateBooks(book.id)}
                className={`cursor-pointer p-4 rounded-xl border shadow-sm hover:shadow-md flex items-center gap-3 transition-all duration-200 ${
                  colors[index % colors.length]
                }`}
              >
                <PiBookOpenFill className='text-2xl shrink-0' />
                <span className='font-medium text-sm sm:text-base whitespace-normal'>
                  {book.grade} - {book.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectBook;
