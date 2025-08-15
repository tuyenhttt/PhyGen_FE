export default function RemovedToggle({
  active,
  onToggle,
  label = 'Đã xóa',
  className = '',
}) {
  return (
    <button
      onClick={onToggle}
      className={
        'px-3 py-1.5 text-sm rounded-xl border ' +
        (active
          ? 'bg-rose-50 text-rose-700 border-rose-300'
          : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200') +
        ` ${className}`
      }
      title='Xem câu hỏi đã xóa'
    >
      {label}
    </button>
  );
}
