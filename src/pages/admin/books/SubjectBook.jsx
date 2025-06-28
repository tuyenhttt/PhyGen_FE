import { useEffect, useState } from 'react';
import BookCard from '@/components/cards/BookCard';
import { getAllSubjectBooks, getSubject } from '@/services/subjectbooksService';
import { useNavigate } from 'react-router-dom';

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
          <div className='text-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl min-h-[70px] mx-auto'>
            {books.map(book => (
              <BookCard
                key={book.id}
                title={`${book.grade} - ${book.name}`}
                onClick={() => handleNavigateBooks(book.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectBook;
