const ClassCard = ({ icon, title, count }) => {
  return (
    <div className='bg-indigo-100 rounded-2xl shadow-md w-[200px] h-[220px] flex flex-col items-center justify-center text-center transition hover:scale-105 hover:shadow-lg duration-300 ease-in-out'>
      <div className='bg-white p-4 rounded-full mb-4 shadow'>
        <img src={icon} alt={title} className='w-20 h-20' />
      </div>
      <h3 className='text-lg font-semibold text-indigo-700 mb-1'>{title}</h3>
      <p className='text-sm text-gray-600'>
        {count.toString().padStart(2, '0')} đề
      </p>
    </div>
  );
};

export default ClassCard;
