const getStatusClass = status => {
  switch (status) {
    //sử dụng cho giao dịch
    case 'Đã thanh toán':
      return 'bg-green-100 text-green-700';
    case 'Hủy':
    case 'Thất bại':
      return 'bg-red-100 text-red-700';
    case 'Chờ thanh toán':
      return 'bg-yellow-100 text-yellow-700';

    // sử dụng cho user
    case 'Đã kích hoạt':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'Chưa kích hoạt':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'Đã khóa':
      return 'bg-red-100 text-red-800 border border-red-300';

    // giá trị default
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(
        status
      )}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
