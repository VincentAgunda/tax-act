import React from 'react';
import { Link } from 'react-router-dom';

const ActCard = ({ act }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{act.title}</h3>
      <p className="text-gray-600 mb-4">{act.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Version: {act.version}</span>
        <Link
          to={`/act/${act.id}`}
          className="bg-[#FFD100] hover:bg-[#FFD100]/90 text-black px-4 py-2 rounded font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ActCard;