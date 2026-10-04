const DashboardCard = ({ titre, valeur }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-500">{titre}</h3>

      <p className="text-4xl font-bold text-green-700 mt-3">
        {valeur}
      </p>
    </div>
  );
};

export default DashboardCard;