import React from 'react';
import { Link } from 'react-router-dom';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export const ServerError: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-100 p-6 rounded-full mb-6">
        <WrenchScrewdriverIcon className="w-16 h-16 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-brand-primary mb-2 font-cairo">Server Error</h1>
      <p className="text-gray-500 mb-8 max-w-md">Something went wrong on our end. Please try again later.</p>
      <Link to="/" className="btn btn-outline btn-primary gap-2">
         Go Home
      </Link>
    </div>
  );
};