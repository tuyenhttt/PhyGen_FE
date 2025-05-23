const PrimaryButton = ({ type = 'button', onClick, children }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
