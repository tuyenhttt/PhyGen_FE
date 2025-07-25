import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti';

const StatAdminCard = ({
  icon,
  iconBg = '#FEE2E2',
  iconColor = '#DC2626',
  label,
  value,
  change,
  isPositive = true,
  linkText = 'Xem thêm',
  onLinkClick,
}) => {
  return (
    <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 max-h-[160px] justify-between'>
      <div className='flex items-center justify-between'>
        <div
          className='p-4 rounded-full'
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className='text-right'>
          <p className='text-sm font-semibold text-gray-500'>{label}</p>
          <p className='text-2xl font-bold text-gray-800'>{value}</p>
        </div>
      </div>

      <div className='flex justify-between items-center text-sm text-gray-500'>
        <div className='flex items-center gap-1'>
          {change ? (
            <p
              className={`font-medium flex items-center gap-1 ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
              <span>{change}</span>
              <span className='text-gray-500 font-normal'>
                so với tuần trước
              </span>
            </p>
          ) : (
            <span className='invisible'>placeholder</span> // giữ layout khi không có change
          )}
        </div>

        {onLinkClick && (
          <button
            onClick={onLinkClick}
            className='text-blue-500 hover:underline whitespace-nowrap'
          >
            {linkText}
          </button>
        )}
      </div>
    </div>
  );
};

export default StatAdminCard;
