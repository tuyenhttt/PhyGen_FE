const CommonButton = ({
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`mt-4 text-sm bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 text-gray-800 font-medium ${className}`}
    >
      {children}
    </button>
  );
};

export default CommonButton;
