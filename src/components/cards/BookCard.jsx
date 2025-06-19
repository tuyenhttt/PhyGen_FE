const BookCard = ({ title, value, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='bg-white rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 p-5 flex justify-between items-center w-full max-w-xs border border-gray-100'
    >
      {/* Text */}
      <div className='flex flex-col'>
        <span className='text-sm text-slate-500 font-medium truncate max-w-[10rem]'>
          {title}
        </span>
        {value && (
          <span className='text-xl font-semibold text-slate-800 mt-1'>
            {value}
          </span>
        )}
      </div>

      {/* Icon */}
      <div className='bg-orange-100 p-3 rounded-lg flex items-center justify-center'>
        {icon || <div className='w-6 h-6 bg-orange-400 rounded' />}
      </div>
    </div>
  );
};

export default BookCard;
