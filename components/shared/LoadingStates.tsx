
import React from 'react';

export const TableSkeleton: React.FC = () => (
  <div className="w-full animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="card w-full bg-base-100 shadow-xl animate-pulse h-96">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full rounded-t-2xl"></div>
    <div className="card-body">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
     <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
     <div className="grid grid-cols-2 gap-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
     </div>
     <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
     <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);
