import { LuBookOpen } from 'react-icons/lu';

const ColorfulBookCard = ({ title, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 cursor-pointer shadow-md text-center hover:scale-[1.02] transition font-medium text-gray-800`}
      style={{ backgroundColor: color, minHeight: '120px' }}
    >
      <div className='flex items-center justify-center gap-2 text-base'>
        <LuBookOpen />
        {title}
      </div>
    </div>
  );
};

export default ColorfulBookCard;
