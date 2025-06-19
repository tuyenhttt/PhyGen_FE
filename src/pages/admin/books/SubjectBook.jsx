import { useEffect, useState } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BookCard from '@/components/cards/BookCard';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { PiExam } from 'react-icons/pi';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { getAllSubjectBooks, getSubject } from '@/services/subjectbooksService';

const SubjectBook = () => {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleCardClick = exam => {
    setSelectedBook(exam);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  useEffect(() => {
    const fetchSubjectBook = async () => {
      try {
        const subjectRes = await getSubject();
        const subjectList = subjectRes.data?.data || [];
        const firstSubjectId = subjectList[0]?.id;

        if (!firstSubjectId) {
          console.warn('Không tìm thấy subject');
          return;
        }

        const res = await getAllSubjectBooks(firstSubjectId);
        const bookList = res.data?.data?.data || [];
        setBooks(bookList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sách:', error);
      }
    };

    fetchSubjectBook();
  }, []);

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Các sách Vật lý
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {books.map(book => (
          <BookCard
            key={book.id}
            title={book.name + ' ' + book.grade}
            onClick={() => handleCardClick(book)}
            icon={<FaClipboardList className='text-orange-500 w-5 h-5' />}
          />
        ))}
      </div>
      <ConfirmModal
        visible={showModal}
        onClose={closeModal}
        title={
          selectedBook
            ? `Thông tin sách ${selectedBook.name} lớp ${selectedBook.grade}`
            : ''
        }
      >
        {selectedBook && (
          <div className='space-y-3 text-lg text-gray-700'>
            <p className='flex items-center gap-2 text-gray-700 text-base'>
              Sách gì đó
            </p>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default SubjectBook;
