const PrimaryButton = ({
  type = 'button',
  onClick,
  children,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
