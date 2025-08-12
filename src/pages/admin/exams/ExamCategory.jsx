import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEllipsisV, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import {
  deleteExamCategory,
  getExamCategory,
  postExamCategory,
  updateExamCategory,
} from '@/services/examService';
import { PiExamFill } from 'react-icons/pi';

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

const ExamCategory = () => {
  const [cats, setCats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    name: '',
    orderNo: '',
    mode: 'add',
    id: null,
  });

  const [selectedCat, setSelectedCat] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchCats = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await getExamCategory({ _ts: Date.now() });
      const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
      const visible = arr.filter(
        x => x?.isDeleted !== true && x?.deletedAt == null
      );
      setCats(visible.sort((a, b) => (a?.orderNo ?? 0) - (b?.orderNo ?? 0)));
    } catch (e) {
      setHasError(true);
      toast.error('Không tải được danh mục kỳ thi');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const refresh = fetchCats;

  const handleAdd = () =>
    setModal({ open: true, name: '', orderNo: '', mode: 'add', id: null });

  const handleEdit = cat =>
    setModal({
      open: true,
      name: cat.name ?? '',
      orderNo: String(cat.orderNo ?? ''),
      mode: 'edit',
      id: cat.id,
    });

  const handleConfirmAddOrEdit = async () => {
    const name = (modal.name || '').trim();
    const orderNo = Number(modal.orderNo);

    if (!name || !Number.isFinite(orderNo)) {
      toast.error('Vui lòng nhập tên và thứ tự hiển thị (số).');
      return;
    }

    try {
      if (modal.mode === 'add') {
        await postExamCategory({ name, orderNo });
        toast.success('Thêm danh mục thành công');
      } else {
        await updateExamCategory({ id: modal.id, name, orderNo });
        toast.success('Cập nhật danh mục thành công');
      }
      setModal({ open: false, name: '', orderNo: '', mode: 'add', id: null });
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error('Lưu danh mục thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExamCategory(selectedCat.id);
      toast.success('Xoá danh mục thành công');
      setDeleteModalOpen(false);
      setSelectedCat(null);
      await refresh();
    } catch (error) {
      console.error('Lỗi xoá danh mục:', error);
      toast.error(error?.response?.data?.message || 'Xoá danh mục thất bại');
    }
  };

  return (
    <div className='flex-1 p-6 bg-gray-100 min-h-screen'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh mục kỳ thi</h2>
        <PrimaryButton
          onClick={handleAdd}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm danh mục kỳ thi
        </PrimaryButton>
      </div>

      <div className='px-2 py-4'>
        {isLoading ? (
          <p className='text-center text-gray-500'>Đang tải...</p>
        ) : hasError ? (
          <p className='text-center text-red-600'>
            Đã xảy ra lỗi khi tải dữ liệu.
          </p>
        ) : cats.length === 0 ? (
          <p className='text-center text-gray-500'>Chưa có danh mục kỳ thi.</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
            {cats.map((cat, index) => (
              <div
                key={cat.id}
                className={`relative p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                  colors[index % colors.length]
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-3 '>
                    <PiExamFill className='text-2xl shrink-0' />
                    <span
                      className='font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] block'
                      title={`${cat.name}`}
                    >
                      {cat.name}
                    </span>
                  </div>

                  {/* Menu ba chấm */}
                  <div className='relative'>
                    <button
                      onClick={() =>
                        setDropdownOpenId(prev =>
                          prev === cat.id ? null : cat.id
                        )
                      }
                      className='text-gray-600 hover:text-gray-900'
                    >
                      <FaEllipsisV className='cursor-pointer' />
                    </button>

                    {dropdownOpenId === cat.id && (
                      <div className='absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-50'>
                        <button
                          onClick={() => {
                            handleEdit(cat);
                            setDropdownOpenId(null);
                          }}
                          className='w-full text-left px-4 py-2 text-yellow-600 hover:bg-gray-100 flex items-center gap-2'
                        >
                          <FaEdit className='text-yellow-600' />
                          <span>Chỉnh sửa</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCat(cat);
                            setDeleteModalOpen(true);
                            setDropdownOpenId(null);
                          }}
                          className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600'
                        >
                          <FaTrash />
                          <span>Xoá</span>
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

      {/* Modal Thêm / Sửa */}
      <ConfirmModal
        visible={modal.open}
        title={
          modal.mode === 'edit' ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'
        }
        onClose={() =>
          setModal({
            open: false,
            name: '',
            orderNo: '',
            mode: 'add',
            id: null,
          })
        }
      >
        <input
          type='text'
          value={modal.name}
          onChange={e => setModal(p => ({ ...p, name: e.target.value }))}
          placeholder='Nhập tên danh mục'
          className='w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <input
          type='number'
          value={modal.orderNo}
          onChange={e => setModal(p => ({ ...p, orderNo: e.target.value }))}
          placeholder='Thứ tự hiển thị'
          className='w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <div className='flex justify-end gap-2'>
          <button
            onClick={() =>
              setModal({
                open: false,
                name: '',
                orderNo: '',
                mode: 'add',
                id: null,
              })
            }
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmAddOrEdit}
            className='px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white'
          >
            {modal.mode === 'edit' ? 'Cập nhật' : 'Thêm'}
          </button>
        </div>
      </ConfirmModal>

      {/* Modal Xoá */}
      <ConfirmModal
        visible={deleteModalOpen}
        title='Xoá danh mục'
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCat(null);
        }}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá <strong>{selectedCat?.name}</strong> không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModalOpen(false)}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            className='px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white'
          >
            Xoá
          </button>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ExamCategory;
