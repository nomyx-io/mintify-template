import React, { ReactNode } from 'react';

interface IconCardProps {
    icon: ReactNode;
    name: string;
    description: string;
    value: string | number;
  }

const IconCard: React.FC<IconCardProps>= ({ icon, name, description, value }) => {
  return (
    <div className="flex items-center p-4 rounded-sm hover:bg-blue-gray-100 cursor-pointer">
      <div className="flex-shrink-0 mr-2 border p-2 rounded">
        {icon}
      </div>
      <div className="flex-grow">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xl font-semibold">{value}</span>
      </div>
    </div>
  );
};

export default IconCard;
