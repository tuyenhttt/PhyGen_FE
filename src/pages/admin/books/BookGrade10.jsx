import BookCard from '@/components/cards/BookCard';
import ReusableTable from '@/components/table/ReusableTable';
import { FaBookOpen } from 'react-icons/fa';
import { LuNotebookPen } from 'react-icons/lu';
import { BsQuestionSquareFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getChapterBySubjectBooks } from '@/services/chapterService';
import { getAllSubjectBooks } from '@/services/subjectbooksService';
import { getTopicByChapterId } from '@/services/topicService';

const BookGrade10 = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const subjectId = 'c0dba2e7-7c75-4daf-8127-b1802e427293';
  const subjectBookTitle = 'Sách Vật Lý Cánh Diều';
  const grade = 10;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const resSubjectBooks = await getAllSubjectBooks(subjectId);
        const subjectBooks = resSubjectBooks.data?.data?.data || [];

        const selectedBook = subjectBooks.find(
          book => book.name?.trim() === subjectBookTitle && book.grade === grade
        );

        if (!selectedBook) {
          console.error('Không tìm thấy sách:', subjectBookTitle, 'lớp', grade);
          return;
        }

        const subjectBookId = selectedBook.id;

        const resChapters = await getChapterBySubjectBooks(
          subjectBookId,
          currentPage,
          10
        );

        const chapterList = resChapters.data?.data?.data || [];
        const totalCount = resChapters.data?.data?.count || 0;

        // Gọi topic cho từng chương
        const chaptersWithTopics = await Promise.all(
          chapterList.map(async (item, index) => {
            let lessonNames = [];

            try {
              const resTopic = await getTopicByChapterId(item.id, 1, 100);
              const topics = resTopic.data?.data?.data || [];
              lessonNames = topics.map(topic => topic.name);
            } catch (err) {
              console.warn('Lỗi lấy topic của chương:', item.name);
            }

            return {
              id: item.id,
              no: (currentPage - 1) * 10 + index + 1,
              chapter: item.name,
              nameOfLesson: lessonNames.length ? lessonNames.join(', ') : '-',
            };
          })
        );

        setChapters(chaptersWithTopics);
        setTotalPages(Math.ceil(totalCount / 10));
      } catch (error) {
        console.error('Lỗi khi lấy chương:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const columns = [
    { header: 'STT', accessor: 'no' },
    { header: 'Chương', accessor: 'chapter' },
    {
      header: 'Tên bài học',
      accessor: 'nameOfLesson',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Số câu hỏi', accessor: 'totalQuestions' },
  ];

  const handleView = row => {
    navigate(`/admin/books/grade10/${row.id}`);
  };

  const handleEdit = row => {
    alert(`Sửa chương: ${row.chapter}`);
  };

  const handleDelete = row => {
    alert(`Xoá chương: ${row.chapter}`);
  };

  return (
    <div className='p-4 space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Sách lớp 10
      </h2>

      {/* Book Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <BookCard
          title='Tổng số chương'
          value={chapters.length}
          icon={<FaBookOpen className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Tổng số bài học'
          value='-' // Nếu chưa có từ API
          icon={<LuNotebookPen className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Tổng số câu hỏi'
          value='-' // Nếu chưa có từ API
          icon={<BsQuestionSquareFill className='text-orange-500 w-6 h-6' />}
        />
      </div>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={chapters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          delete: 'delete',
        }}
      />
    </div>
  );
};

export default BookGrade10;
