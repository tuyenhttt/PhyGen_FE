import ReusableTable from '@/components/table/ReusableTable';
import { getAllMatrices } from '@/services/matrixService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Matrices = () => {
  const navigate = useNavigate();

  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const response = await getAllMatrices();
      const raw = response.data;

      const list = Array.isArray(raw.data?.data) ? raw.data.data : [];

      const formatted = list.map((item, index) => ({
        ...item,
        no: (currentPage - 1) * 10 + index + 1,
      }));

      setMatrices(formatted);
      setTotalPages(Math.ceil(raw.data.count / 10));
    } catch (error) {
      console.error('Lỗi khi lấy ma trận:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, [currentPage]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Tên ma trận',
      accessor: 'name',
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
    { header: 'Năm', accessor: 'year' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    { header: 'Người tạo', accessor: 'createdBy' },
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
    <div className='p-4 space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Danh sách ma trận đề thi
      </h2>
      <ReusableTable
        columns={columns}
        data={matrices}
        isLoading={isLoading}
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

export default Matrices;
