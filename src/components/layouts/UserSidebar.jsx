import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

// Menu item definitions
const menuItems = [{ label: 'Hồ sơ', icon: <FaUser /> }];

// Define base path for each label
const labelPaths = {
  'Hồ sơ': '/user',
};

// Helper function to check if menu item is active
const isActive = (label, pathname) => {
  const basePath = labelPaths[label];
  if (!basePath) return false;
  if (label === 'Thống kê') return pathname === basePath;
  return pathname.startsWith(basePath);
};

const UserSidebar = ({ name }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = label => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleClick = item => {
    if (item.children) {
      toggleMenu(item.label);
    } else {
      const path = labelPaths[item.label];
      if (path) navigate(path);
    }
  };

  return (
    <div className='w-64 bg-white border-r min-h-screen p-4 pt-20'>
      <div className='flex items-center space-x-3 mb-6'>
        <div className='bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold'>
          ND
        </div>
        <div>
          <div className='text-gray-600 text-sm'>Xin chào,</div>
          <div className='font-semibold text-lg'>{name || 'User'}</div>
        </div>
      </div>

      {/* Menu */}
      <nav className='space-y-2 text-sm text-blue-700'>
        <ul className='space-y-2'>
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded cursor-pointer transition ${
                  isActive(item.label, location.pathname)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleClick(item)}
              >
                <div className='flex items-center gap-3 overflow-hidden whitespace-nowrap'>
                  <span>{item.icon}</span>
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

              {/* Dropdown children */}
              {item.children && openMenus[item.label] && (
                <ul className='ml-8 mt-1 space-y-1'>
                  {item.children.map((child, cidx) => {
                    const isChildActive =
                      location.pathname === labelPaths[child];
                    return (
                      <li
                        key={cidx}
                        className={`text-sm cursor-pointer transition truncate mb-3 px-2 py-1 rounded ${
                          isChildActive
                            ? 'bg-[#475569] text-white font-medium'
                            : 'text-gray-300 hover:text-white hover:bg-[#334155]'
                        }`}
                        onClick={() => {
                          const path = labelPaths[child];
                          if (path) navigate(path);
                        }}
                      >
                        {child}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className='mt-10 space-y-2 text-sm text-gray-700'></div>
    </div>
  );
};

export default UserSidebar;
