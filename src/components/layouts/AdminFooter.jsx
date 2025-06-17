import { FaHeart } from 'react-icons/fa';

const AdminFooter = () => {
  return (
    <footer className='text-center text-sm text-gray-300 py-4 bg-black'>
      <div className='flex justify-center items-center gap-2'>
        <span>2025 © H.T. Crafted by</span>
        <FaHeart className='text-red-600' />
        <span className='text-emerald-400 font-semibold'>Chill Group</span>
      </div>
    </footer>
  );
};

export default AdminFooter;
