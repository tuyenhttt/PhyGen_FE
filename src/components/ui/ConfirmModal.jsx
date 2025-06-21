const ConfirmModal = ({
  visible,
  title,
  onClose,
  children,
  width = 'max-w-md',
}) => {
  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
      <div
        className={`relative bg-white p-6 sm:p-8 rounded-xl shadow-2xl border w-full sm:w-[90%] ${width}`}
      >
        <button
          className='absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold'
          onClick={onClose}
        >
          &times;
        </button>

        {title && (
          <h3 className='text-xl font-semibold mb-4 text-center text-gray-800'>
            {title}
          </h3>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};

export default ConfirmModal;
