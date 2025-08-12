import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSubjectBooks,
  postSubjectBook,
  deleteSubjectBook,
  updateSubjectBook,
} from '@/services/subjectbooksService';
import { getSubject } from '@/services/subjectService';
import { PiBookOpenFill } from 'react-icons/pi';
import { FaPlus, FaEllipsisV, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';

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
  const [subjectId, setSubjectId] = useState(null);

  const [bookModal, setBookModal] = useState({
    open: false,
    name: '',
    grade: '',
    mode: 'add',
    id: null,
  });

  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

        const res = await getAllSubjectBooks(firstSubjectId, 1, 20);
        setSubjectId(firstSubjectId);
        setBooks(res.data?.data?.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sách:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectBook();
  }, []);

  const refreshBooks = async () => {
    const res = await getAllSubjectBooks(subjectId, 1, 20);
    setBooks(res.data?.data?.data || []);
  };

  const handleNavigateBooks = bookId => {
    navigate(`/admin/subject-book/${bookId}`);
  };

  const handleAddBook = () => {
    setBookModal({ open: true, name: '', grade: '', mode: 'add', id: null });
  };

  const handleEditBook = book => {
    setBookModal({
      open: true,
      name: book.name,
      grade: book.grade.toString(),
      mode: 'edit',
      id: book.id,
    });
  };

  const handleConfirmAddOrEditBook = async () => {
    const name = bookModal.name.trim();
    const grade = Number(bookModal.grade);

    if (!name || !grade) {
      toast.error('Vui lòng nhập đầy đủ tên sách và lớp học');
      return;
    }

    const payload = {
      name,
      grade,
      subjectId,
    };

    try {
      if (bookModal.mode === 'add') {
        await postSubjectBook(payload);
        toast.success('Thêm sách thành công');
      } else {
        await updateSubjectBook({
          ...payload,
          id: bookModal.id,
        });
        toast.success('Cập nhật sách thành công');
      }

      setBookModal({ open: false, name: '', grade: '', mode: 'add', id: null });
      await refreshBooks();
    } catch (error) {
      console.error('Lỗi khi cập nhật sách:', error);
      toast.error('Cập nhật sách thất bại');
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteSubjectBook(selectedBook.id);
      toast.success('Xoá sách thành công');
      setDeleteModalOpen(false);
      setSelectedBook(null);
      await refreshBooks();
    } catch (error) {
      console.error('Lỗi xoá sách:', error);
      toast.error('Xoá sách thất bại');
    }
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold '>Các sách Vật lý</h2>
        <PrimaryButton
          onClick={handleAddBook}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm sách
        </PrimaryButton>
      </div>

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
                className={`relative p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                  colors[index % colors.length]
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div
                    className='flex items-center gap-3 cursor-pointer'
                    onClick={() => handleNavigateBooks(book.id)}
                  >
                    <PiBookOpenFill className='text-2xl shrink-0' />
                    <span
                      className='font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] block'
                      title={`${book.grade} - ${book.name}`}
                    >
                      {book.grade} - {book.name}
                    </span>
                  </div>
                  <div className='relative'>
                    <button
                      onClick={() =>
                        setDropdownOpenId(prev =>
                          prev === book.id ? null : book.id
                        )
                      }
                      className='text-gray-600 hover:text-gray-900'
                    >
                      <FaEllipsisV className='cursor-pointer' />
                    </button>
                    {dropdownOpenId === book.id && (
                      <div className='absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-50'>
                        <button
                          onClick={() => {
                            handleNavigateBooks(book.id);
                            setDropdownOpenId(null);
                          }}
                          className='w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 flex items-center gap-2'
                        >
                          <FaEye className='text-blue-600' />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          onClick={() => {
                            handleEditBook(book);
                            setDropdownOpenId(null);
                          }}
                          className='w-full text-left px-4 py-2 text-yellow-600 hover:bg-gray-100 flex items-center gap-2'
                        >
                          <FaEdit className='text-yellow-600' />
                          <span>Chỉnh sửa</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setDeleteModalOpen(true);
                            setDropdownOpenId(null);
                          }}
                          className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600'
                        >
                          <FaTrash />
                          <span>Xoá sách</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa sách */}
      <ConfirmModal
        visible={bookModal.open}
        title={bookModal.mode === 'edit' ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        onClose={() =>
          setBookModal({
            open: false,
            name: '',
            grade: '',
            mode: 'add',
            id: null,
          })
        }
      >
        <input
          type='text'
          value={bookModal.name}
          onChange={e =>
            setBookModal(prev => ({ ...prev, name: e.target.value }))
          }
          placeholder='Nhập tên sách'
          className='w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <select
          value={bookModal.grade}
          onChange={e =>
            setBookModal(prev => ({ ...prev, grade: e.target.value }))
          }
          className='w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        >
          <option value='' disabled>
            Chọn lớp
          </option>
          <option value='10'>Lớp 10</option>
          <option value='11'>Lớp 11</option>
          <option value='12'>Lớp 12</option>
        </select>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() =>
              setBookModal({
                open: false,
                name: '',
                grade: '',
                mode: 'add',
                id: null,
              })
            }
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmAddOrEditBook}
            className='px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white'
          >
            {bookModal.mode === 'edit' ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </ConfirmModal>

      {/* Modal Xoá sách */}
      <ConfirmModal
        visible={deleteModalOpen}
        title='Xoá sách'
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBook(null);
        }}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá sách <strong>{selectedBook?.name}</strong>{' '}
          không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModalOpen(false)}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleDeleteBook}
            className='px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white'
          >
            Xoá
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default SubjectBook;
