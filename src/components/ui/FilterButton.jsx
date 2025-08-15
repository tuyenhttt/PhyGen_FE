import { FaChevronDown } from 'react-icons/fa';

const FilterButton = ({
  label,
  count = 0,
  isOpen = false,
  onClick,
  icon,
  className = '',
  color = {
    light: 'text-blue-700',
    soft: 'bg-blue-100 text-blue-800',
    border: 'border-blue-800',
  },
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={[
        'h-10 pl-3 pr-2 rounded-full border text-sm flex items-center gap-2',
        'bg-white hover:bg-gray-50 shadow-sm',
        color.border,
        color.light,
        className,
      ].join(' ')}
      aria-expanded={isOpen}
    >
      {icon && <span className='flex items-center justify-center'>{icon}</span>}
      <span>{label}</span>

      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${color.soft}`}>
          {count}
        </span>
      )}

      <FaChevronDown
        className={`text-xs transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
};

export default FilterButton;
