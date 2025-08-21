import { twMerge } from 'tailwind-merge';

const PrimaryButton = ({
  type = 'button',
  onClick,
  children,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2 text-md font-medium text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
