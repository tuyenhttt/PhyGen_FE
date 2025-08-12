import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';

import { deleteMatrix, getAllMatrices } from '@/services/matrixService';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Matrices = () => {
  const navigate = useNavigate();

  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filter, setFilter] = useState({
    grade: '',
    year: '',
    subjectId: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, matrix: null });

  const activeFilterCount = [
    filter.grade,
    filter.year,
    filter.subjectId,
  ].filter(Boolean).length;

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const res = await getAllMatrices({
        PageIndex: currentPage,
        PageSize: PAGE_SIZE,
        Grade: filter.grade ? [Number(filter.grade)] : undefined,
        Year: filter.year ? [Number(filter.year)] : undefined,
        SubjectId: filter.subjectId || undefined,
        Search: debouncedSearch || undefined,
      });

      const raw = res.data;
      const list = Array.isArray(raw?.data?.data) ? raw.data.data : [];
      const count = Number(raw?.data?.count || 0);

      const formatted = list.map((item, index) => ({
        ...item,
        no: (currentPage - 1) * PAGE_SIZE + index + 1,
      }));

      setMatrices(formatted);
      setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
    } catch (error) {
      console.error('Lỗi khi lấy ma trận:', error);
      toast.error('Không tải được danh sách ma trận');
      setMatrices([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, [
    currentPage,
    debouncedSearch,
    filter.grade,
    filter.year,
    filter.subjectId,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filter.grade, filter.year, filter.subjectId]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Tên ma trận',
      accessor: 'name',
      render: value => (
        <div className='max-w-[180px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[220px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Năm', accessor: 'year' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    { header: 'Người tạo', accessor: 'createdBy' },
  ];

  const handleView = row =>
    navigate(`/admin/exams-category/matrices/${row.id}`);

  const handleDeleteMatrix = matrix => setDeleteModal({ open: true, matrix });

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
        <h2 className='text-2xl font-bold'>Danh sách ma trận đề thi</h2>
        <PrimaryButton
          onClick={() => navigate('/admin/exams-category/matrices/create')}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Tải lên ma trận
        </PrimaryButton>
      </div>

      <ReusableTable
        title='Danh sách ma trận'
        columns={columns}
        data={matrices}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          delete: handleDeleteMatrix,
        }}
        actionIcons={{ view: 'view', delete: 'delete' }}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm kiếm ma trận...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className='border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
            >
              <IoFilter />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterModal && (
              <div className='absolute top-full right-0 mt-2 z-50 w-80 bg-white border shadow-md rounded-md p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <MdOutlineClear />
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
                  {/* Khối lớp */}
                  <div>
                    <label className='font-medium'>Khối lớp</label>
                    <select
                      value={filter.grade}
                      onChange={e =>
                        setFilter({ ...filter, grade: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='10'>Lớp 10</option>
                      <option value='11'>Lớp 11</option>
                      <option value='12'>Lớp 12</option>
                    </select>
                  </div>

                  {/* Năm */}
                  <div>
                    <label className='font-medium'>Năm</label>
                    <select
                      value={filter.year}
                      onChange={e =>
                        setFilter({ ...filter, year: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setFilter({ grade: '', year: '', subjectId: '' });
                      setShowFilterModal(false);
                    }}
                    className='text-sm px-3 py-1.5 border rounded'
                  >
                    Bỏ lọc
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className='text-sm px-3 py-1.5 bg-blue-600 text-white rounded'
                  >
                    Lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        }
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
