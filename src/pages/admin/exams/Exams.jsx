import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const Exams = () => {
  const navigate = useNavigate();

  const data = [
    {
      examId: 'dt001',
      examName: 'Đề thi giữa kỳ 1 - Lớp 10',
      matrixId: 'mt001',
      examCategotyId: 'gk1-10',
      subjectBook: 'Vật lý 10 - Cánh diều',
      createdBy: 'Admin',
      createdAt: '2024-05-01',
    },
    {
      examId: 'dt002',
      examName: 'Đề thi cuối kỳ 1 - Lớp 10',
      matrixId: 'mt002',
      examCategotyId: 'ck1-10',
      subjectBook: 'Vật lý 10 - Kết nối tri thức',
      createdBy: 'Admin',
      createdAt: '2024-05-15',
    },
    {
      examId: 'dt003',
      examName: 'Đề thi giữa kỳ 2 - Lớp 11',
      matrixId: 'mt003',
      examCategotyId: 'gk2-11',
      subjectBook: 'Vật lý 11 - Chân trời sáng tạo',
      createdBy: 'GV A',
      createdAt: '2024-06-01',
    },
    {
      examId: 'dt004',
      examName: 'Đề thi cuối kỳ 2 - Lớp 11',
      matrixId: 'mt004',
      examCategotyId: 'ck2-11',
      subjectBook: 'Vật lý 11 - Cánh diều',
      createdBy: 'GV B',
      createdAt: '2024-06-10',
    },
  ];

  const columns = [
    { header: 'STT', accessor: 'no' },
    { header: 'Mã đề', accessor: 'examId' },
    {
      header: 'Tên đề thi',
      accessor: 'examName',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Mã ma trận', accessor: 'matrixId' },
    { header: 'Mã đề thi', accessor: 'examCategotyId' },
    { header: 'Tên sách', accessor: 'subjectBook' },
    { header: 'Người tạo', accessor: 'createdBy' },
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
        Danh sách đề thi
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

export default Exams;
