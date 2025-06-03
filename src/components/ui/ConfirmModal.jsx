const ConfirmModal = ({
  visible,
  title,
  onClose,
  children,
  width = 'max-w-md',
}) => {
  if (!visible) return null;

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30'>
      <div
        className={`relative bg-white p-8 rounded-xl shadow-2xl border w-[90%] ${width}`}
      >
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold'
          onClick={onClose}
        >
          &times;
        </button>
        {title && (
          <h3 className='text-xl font-semibold mb-4 text-center text-gray-800'>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export default ConfirmModal;
