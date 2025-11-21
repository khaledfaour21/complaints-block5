import React from 'react';
import { Link } from 'react-router-dom';
import { useLangStore } from '../../store';
import { HomeIcon } from '@heroicons/react/24/outline';

export const NotFound: React.FC = () => {
  const { t } = useLangStore();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-bold text-brand-primary/20">404</h1>
      <h2 className="text-3xl font-bold text-brand-primary mt-4 mb-2 font-cairo">{t('error.404')}</h2>
      <p className="text-gray-500 mb-8 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link to="/" className="btn btn-primary text-white gap-2">
        <HomeIcon className="w-5 h-5" /> {t('error.home')}
      </Link>
    </div>
  );
};