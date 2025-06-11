import BookCard from '@/components/cards/BookCard';
import ReusableTable from '@/components/table/ReusableTable';
import { FaBookOpen } from 'react-icons/fa';
import { LuNotebookPen } from 'react-icons/lu';
import { BsQuestionSquareFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const BookGrade10 = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      chapter: 'Chương 1',
      nameOfLesson: 'Bài 1',
      totalQuestions: '11',
    },
  ];

  const columns = [
    { header: 'Chương', accessor: 'chapter' },
    { header: 'Tên bài học', accessor: 'nameOfLesson' },
    { header: 'Số câu hỏi', accessor: 'totalQuestions' },
  ];

  const handleView = row => {
    navigate(`/admin/books/grade10/${row.id}`);
  };

  const handleEdit = row => {
    alert(`Sửa: ${row.name}`);
  };

  const handleDelete = row => {
    alert(`Xoá: ${row.name}`);
  };

  return (
    <div className='p-4 space-y-6 '>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Sách lớp 10
      </h2>
      {/* Book Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <BookCard
          title='Tổng số chương'
          value='23'
          icon={<FaBookOpen className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Tổng số bài học'
          value='50'
          icon={<LuNotebookPen className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Tổng số câu hỏi'
          value='87'
          icon={<BsQuestionSquareFill className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Tổng số gì gì đó'
          value='999'
          icon={<FaBookOpen className='text-orange-500 w-6 h-6' />}
        />
      </div>

      {/* Table */}
      <div>
        <ReusableTable
          title={'Danh sách bài học'}
          columns={columns}
          data={data}
          currentPage={1}
          totalPages={3}
          onPageChange={page => console.log('Go to page:', page)}
          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}
        />
      </div>
    </div>
  );
};

export default BookGrade10;
