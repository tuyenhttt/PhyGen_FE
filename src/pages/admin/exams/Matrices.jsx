import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { deleteMatrix, getAllMatrices } from '@/services/matrixService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const Matrices = () => {
  const navigate = useNavigate();

  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const response = await getAllMatrices({
        pageIndex: currentPage,
        pageSize: 10,
      });
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
    navigate(`/admin/exams-category/matrices/${row.id}`);
  };

  const handleEdit = row => {
    navigate(`/admin/exams-category/matrices/${row.id}/edit`);
  };

  const handleDeleteMatrix = matrix => {
    setDeleteModal({ open: true, matrix });
  };

  const confirmDeleteMatrix = async () => {
    try {
      await deleteMatrix(deleteModal.matrix.id);
      toast.success('Xoá ma trận thành công');
      setDeleteModal({ open: false, matrix: null });
      fetchMatrices();
    } catch (error) {
      console.error('Lỗi khi xoá ma trận:', error);
      toast.error('Lỗi khi xoá ma trận');
    }
  };

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
          Danh sách ma trận đề thi
        </h2>
        <button
          onClick={console.log('Thêm câu hỏi hay sao mà click dô')}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Tải lên ma trận
        </button>
      </div>
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
          delete: handleDeleteMatrix,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          delete: 'delete',
        }}
      />

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá ma trận'
        onClose={() => setDeleteModal({ open: false, matrix: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá ma trận này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, matrix: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteMatrix}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Matrices;
