const InfoCard = ({ icon, label, count }) => (
  <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center max-w-[160px]'>
    {icon}
    <p className='text-blue-900 font-semibold text-sm mb-1 mt-2'>{count}</p>
    <p className='text-gray-600 text-xs'>{label}</p>
  </div>
);
export default InfoCard;
