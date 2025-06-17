const getStatusClass = status => {
  const base = 'px-2 py-1 rounded text-xs font-medium';

  const statusStyles = {
    // Giao dịch
    'Đã thanh toán': 'bg-green-100 text-green-700',
    Hủy: 'bg-red-100 text-red-700',
    'Thất bại': 'bg-red-100 text-red-700',
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-700',

    // Người dùng - kích hoạt
    'Đã kích hoạt': 'bg-green-100 text-green-800 border border-green-300',
    'Chưa kích hoạt': 'bg-yellow-100 text-yellow-800 border border-yellow-300',

    // Người dùng - hoạt động
    'Đang hoạt động': 'bg-green-100 text-green-800 border border-green-300',
    'Đã khóa': 'bg-red-100 text-red-800 border border-red-300',
  };

  return `${base} ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`;
};

const StatusBadge = ({ status }) => {
  return <span className={getStatusClass(status)}>{status}</span>;
};

export default StatusBadge;
