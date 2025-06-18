import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const Matrices = () => {
  const navigate = useNavigate();
  const data = [
    {
      matrixId: 'mt001',
      matrixName: 'Ma trận Đề thi giữa kỳ 1 - Lớp 10',
      description: 'Miêu tả ma trận vật lý giữa kỳ 1 - Lớp 10',
      grade: '10',
      examCategotyId: 'gk1-10',
      createdBy: 'Admin',
      createdAt: '2024-05-01',
    },
    {
      matrixId: 'mt002',
      matrixName: 'Ma trận Đề thi cuối kỳ 1 - Lớp 10',
      description: 'Miêu tả ma trận vật lý cuối kỳ 1 - Lớp 10',
      grade: '10',
      examCategotyId: 'ck1-10',
      createdBy: 'Admin',
      createdAt: '2024-05-15',
    },
    {
      matrixId: 'mt003',
      matrixName: 'Ma trận Đề thi giữa kỳ 2 - Lớp 11',
      description: 'Miêu tả ma trận vật lý giữa kỳ 2 - Lớp 11',
      grade: '11',
      examCategotyId: 'gk2-11',
      createdBy: 'GV A',
      createdAt: '2024-06-01',
    },
    {
      matrixId: 'mt004',
      matrixName: 'Ma trận Đề thi cuối kỳ 2 - Lớp 11',
      description: 'Miêu tả ma trận vật lý cuối kỳ 2 - Lớp 11',
      grade: '11',
      examCategotyId: 'ck2-11',
      createdBy: 'GV B',
      createdAt: '2024-06-10',
    },
  ];

  const columns = [
    { header: 'STT', accessor: 'no' },
    { header: 'Mã ma trận', accessor: 'matrixId' },
    {
      header: 'Tên ma trận',
      accessor: 'matrixName',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Mã kỳ thi', accessor: 'examCategotyId' },
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
        Danh sách ma trận đề thi
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

export default Matrices;
