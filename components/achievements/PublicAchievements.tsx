import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Achievement } from '../../types';
import { useLangStore } from '../../store';
import { TrophyIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { CardSkeleton } from '../shared/LoadingStates';

export const PublicAchievements: React.FC = () => {
  const { t } = useLangStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAchievements().then(data => {
        setAchievements(data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
        <div className="text-center max-w-2xl mx-auto py-10">
            <div className="w-16 h-16 bg-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-accent font-cairo mb-4">{t('achieve.title')}</h1>
            <p className="text-gray-500">Celebrating the progress and success stories of our community in the Fifth Block.</p>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <CardSkeleton key={i} />)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {achievements.map(ach => (
                    <div key={ach.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                        <figure className="relative h-56">
                            <img 
                                src={ach.images[0] || 'https://via.placeholder.com/400x250'} 
                                alt={ach.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title font-cairo text-xl font-bold text-brand-primary dark:text-white">{ach.title}</h2>
                            <div className="flex items-center gap-2 text-xs text-brand-accent font-bold uppercase tracking-wider mb-2">
                                <CalendarIcon className="w-4 h-4" /> {ach.date}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{ach.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};