import { FaBell, FaEnvelope, FaMoon, FaUserCircle } from 'react-icons/fa';

const HeaderAdmin = () => {
  return (
    <header className='h-20 bg-white shadow-sm px-6 flex items-center justify-between fixed top-0 left-64 w-[calc(100%-16rem)] z-40'>
      <h1 className='text-lg font-bold text-gray-800'>
        Chào mừng bạn đến với
        <span className='text-blue-600 font-bold'> PHYGEN</span>!
      </h1>
      <div className='flex items-center gap-6'>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaMoon size={18} />
        </button>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaEnvelope size={18} />
        </button>
        <button className='hover:text-blue-600 text-gray-500 transition-colors duration-200'>
          <FaBell size={18} />
        </button>
        <div className='w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow cursor-pointer hover:ring-2 hover:ring-blue-500 transition'>
          <FaUserCircle size={20} className='text-gray-600' />
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
