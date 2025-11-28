import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Achievement } from '../../types';
import { useLangStore } from '../../store';
import { TrophyIcon, CalendarIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
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
                            {ach.media.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <PhotoIcon className="w-12 h-12" />
                                </div>
                            ) : ach.media.length === 1 ? (
                                ach.media[0].type === 'video' ? (
                                    <video
                                        src={ach.media[0].url}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={ach.media[0].url}
                                        alt={ach.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                )
                            ) : (
                                <div className="grid grid-cols-2 gap-1 h-full">
                                    {ach.media.slice(0, 4).map((media, index) => (
                                        <div key={index} className="relative overflow-hidden">
                                            {media.type === 'video' ? (
                                                <video
                                                    src={media.url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    muted
                                                />
                                            ) : (
                                                <img
                                                    src={media.url}
                                                    alt={`${ach.title} ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            )}
                                            {index === 3 && ach.media.length > 4 && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">+{ach.media.length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </figure>
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <h2 className="card-title font-cairo text-xl font-bold text-brand-primary dark:text-white">{ach.title}</h2>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2 text-xs text-brand-accent font-bold uppercase tracking-wider">
                                        <CalendarIcon className="w-4 h-4" /> {ach.date}
                                    </div>
                                    {ach.media.length > 0 && (
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                            {ach.media.filter(m => m.type === 'image').length > 0 && <PhotoIcon className="w-3 h-3" />}
                                            {ach.media.filter(m => m.type === 'video').length > 0 && <VideoCameraIcon className="w-3 h-3" />}
                                            {ach.media.length}
                                        </span>
                                    )}
                                </div>
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