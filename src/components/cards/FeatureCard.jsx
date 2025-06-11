const FeatureCard = ({ title, description }) => {
  return (
    <div className='p-6 rounded-2xl bg-gray-200 text-gray-800 shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 border border-gray-200 hover:border-indigo-500'>
      <h3 className='text-xl font-semibold mb-3 text-indigo-600'>{title}</h3>
      <p className='text-gray-600 text-sm leading-relaxed'>{description}</p>
    </div>
  );
};

export default FeatureCard;
