import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { deleteExam, getAllExams } from '@/services/examService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const response = await getAllExams();
      const raw = response.data;
      const list = Array.isArray(raw.data?.data) ? raw.data.data : [];

      const formatted = list.map((item, index) => ({
        ...item,
        no: (currentPage - 1) * 10 + index + 1,
      }));

      setExams(formatted);
      setTotalPages(Math.ceil(raw.data.count / 10));
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [currentPage]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Tên đề thi',
      accessor: 'title',
      render: value => (
        <div className='max-w-[200px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[250px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Năm', accessor: 'year' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    { header: 'Số phiên bản', accessor: 'versionCount' },
    {
      header: 'Xáo trộn?',
      accessor: 'randomizeQuestions',
      render: value => (value ? 'Có' : 'Không'),
    },
  ];

  const handleView = row => {
    navigate(`/admin/exams/${row.id}`);
  };

  const handleDeleteExam = exam => {
    setDeleteModal({ open: true, exam });
  };

  const confirmDeleteExam = async () => {
    try {
      await deleteExam(deleteModal.exam.id);
      toast.success('Xoá đề thi thành công');
      setDeleteModal({ open: false, exam: null });
      fetchExams();
    } catch (error) {
      console.error('Lỗi khi xoá đề thi:', error);
      toast.error('Lỗi khi xoá đề thi');
    }
  };

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
          Danh sách đề thi
        </h2>
        <button
          onClick={console.log('Thêm câu hỏi hay sao mà click dô')}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm đề thi
        </button>
      </div>
      <ReusableTable
        columns={columns}
        data={exams}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          delete: handleDeleteExam,
        }}
        actionIcons={{
          view: 'view',
          delete: 'delete',
        }}
      />

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá đề thi'
        onClose={() => setDeleteModal({ open: false, exam: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá đề thi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, exam: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteExam}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Exams;
