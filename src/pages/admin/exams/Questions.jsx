import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const navigate = useNavigate();
  const data = [
    {
      content: 'Nội dung câu hỏi Nội dung câu hỏi',
      type: 'Trắc nghiệm',
      level: 'VD',
      topic: 'Bài 1',
      createdBy: 'Admin',
      createdAt: '2024-05-01',
    },
    {
      content: 'Nội dung câu hỏi',
      type: 'Tự luận',
      level: 'NB',
      topic: 'Bài 2',
      createdBy: 'Admin',
      createdAt: '2024-05-15',
    },
    {
      content: 'Nội dung câu hỏi',
      type: 'Trắc nghiệm',
      level: 'VDC',
      topic: 'Bài 3',
      createdBy: 'GV A',
      createdAt: '2024-06-01',
    },
    {
      content: 'Nội dung câu hỏi',
      type: 'Tự luận',
      level: 'NB',
      topic: 'Bài 4',
      createdBy: 'GV B',
      createdAt: '2024-06-10',
    },
  ];

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Loại', accessor: 'type' },
    { header: 'Cấp độ', accessor: 'level' },
    { header: 'Bài', accessor: 'topic' },
    { header: 'Ngày tạo', accessor: 'createdAt' },
    { header: 'Ngày tạo', accessor: 'createdAt' },
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
        Danh sách câu hỏi
      </h2>
      {/* Table */}
      <div>
        <ReusableTable
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
          actionIcons={{
            view: 'view',
            edit: 'edit',
            delete: 'delete',
          }}
        />
      </div>
    </div>
  );
};

export default Questions;
