const FeatureCard = ({ title, description }) => {
  return(
  <div className="p-6 rounded-2xl shadow-md bg-white hover:shadow-xl transition">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
  );
};

export default FeatureCard;