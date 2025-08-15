import { twMerge } from 'tailwind-merge';

const CommonButton = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'text-sm bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 text-gray-800 font-medium',
        disabled && 'opacity-80 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};

export default CommonButton;
