import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaUser,
  FaBook,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { RiDashboardFill } from 'react-icons/ri';
import { PiExamLight } from 'react-icons/pi';
import { IoWalletSharp } from 'react-icons/io5';

// Menu item definitions
const menuItems = [
  { label: 'Thống kê', icon: <RiDashboardFill /> },
  {
    label: 'Kỳ thi',
    icon: <PiExamLight />,
    children: ['Đề thi', 'Ma trận đề thi', 'Câu hỏi'],
  },
  {
    label: 'Khung chương trình',
    icon: <FaLayerGroup />,
    children: ['Lớp 10', 'Lớp 11', 'Lớp 12'],
  },
  {
    label: 'Sách',
    icon: <FaBook />,
    children: ['Lớp 10', 'Lớp 11', 'Lớp 12'],
  },
  { label: 'Người dùng', icon: <FaUser /> },
  { label: 'Giao dịch', icon: <IoWalletSharp /> },
];

// Define base path for each label
const labelPaths = {
  'Thống kê': '/admin',
  'Người dùng': '/admin/users',
  'Giao dịch': '/admin/transactions',
  Sách: '/admin/books',
  'Khung chương trình': '/admin/curriculum',
  'Kỳ thi': '/admin/exams',
};

// Helper function to check if menu item is active
const isActive = (label, pathname) => {
  const basePath = labelPaths[label];
  if (!basePath) return false;
  if (label === 'Thống kê') return pathname === basePath;
  return pathname.startsWith(basePath);
};

const AdminSidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = label => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className='w-64 fixed top-0 left-0 z-50 bg-[#1E293B] text-white shadow-lg h-full'
      style={{ overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* Logo */}
      <div className='flex justify-center items-center py-5'>
        <h1 className='text-2xl font-semibold tracking-wide'>PHYGEN</h1>
      </div>

      {/* Menu */}
      <nav className='mt-2 px-3 pb-6'>
        <ul className='space-y-2'>
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <div
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition ${
                  isActive(item.label, location.pathname)
                    ? 'bg-[#334155] text-white'
                    : 'hover:bg-[#334155] text-gray-300'
                }`}
                onClick={() => item.children && toggleMenu(item.label)}
              >
                <div className='flex items-center gap-3 overflow-hidden whitespace-nowrap'>
                  <span className='text-gray-400'>{item.icon}</span>
                  <span className='text-sm font-medium truncate'>
                    {item.label}
                  </span>
                </div>
                {item.children && (
                  <span className='text-xs'>
                    {openMenus[item.label] ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                )}
              </div>
              {item.children && openMenus[item.label] && (
                <ul className='ml-8 mt-1 space-y-1'>
                  {item.children.map((child, cidx) => (
                    <li
                      key={cidx}
                      className='text-sm text-gray-300 hover:text-white cursor-pointer transition truncate mb-3'
                    >
                      {child}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
