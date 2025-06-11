const BookCard = ({ title, value, icon }) => {
  return (
    <div className='bg-white rounded-xl shadow p-4 flex justify-between items-center w-full max-w-xs'>
      {/* Text content */}
      <div className='flex flex-col'>
        <span className='text-sm text-slate-500 font-medium'>{title}</span>
        <span className='text-xl font-semibold text-slate-800 mt-1'>
          {value}
        </span>
      </div>

      {/* Icon */}
      <div className='bg-orange-100 p-3 rounded-lg flex items-center justify-center'>
        {icon || <div className='w-6 h-6 bg-orange-400 rounded' />}
      </div>
    </div>
  );
};

export default BookCard;
