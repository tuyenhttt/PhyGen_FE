import { FaHome, FaChartBar, FaUsers, FaCog } from 'react-icons/fa';

const menuItems = [
  { icon: <FaHome />, label: 'Dashboard' },
  { icon: <FaChartBar />, label: 'Thống kê' },
  { icon: <FaUsers />, label: 'Người dùng' },
  { icon: <FaCog />, label: 'Cài đặt' },
];

const AdminSidebar = () => {
  return (
    <aside className='w-64 h-screen bg-[#1E293B] text-white fixed top-0 left-0 z-50 shadow-lg'>
      {/* Title */}
      <div className='flex justify-center items-center py-6 '>
        <h1 className='text-3xl font-bold tracking-wide text-white'>PHYGEN</h1>
      </div>

      {/* Navigation */}
      <nav className='mt-4'>
        <ul className='px-4 space-y-2'>
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className='flex items-center gap-3 p-3 rounded-lg hover:bg-[#334155] hover:text-white transition duration-200 cursor-pointer group'
            >
              <div className='text-gray-400 group-hover:text-white transition'>
                {item.icon}
              </div>
              <span className='text-sm font-medium'>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
