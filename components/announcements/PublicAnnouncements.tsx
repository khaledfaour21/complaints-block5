import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Announcement } from '../../types';
import { useLangStore } from '../../store';
import { MegaphoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from '../shared/LoadingStates';

export const PublicAnnouncements: React.FC = () => {
  const { t } = useLangStore();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnnouncements().then(res => {
        // Sort sticky first
        const sorted = res.sort((a, b) => (a.isSticky === b.isSticky ? 0 : a.isSticky ? -1 : 1));
        setList(sorted);
        setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
         <div className="text-center max-w-2xl mx-auto py-8">
            <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MegaphoneIcon className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-accent font-cairo mb-2">{t('ann.title')}</h1>
            <p className="text-gray-500">Stay updated with the latest news and events.</p>
        </div>

        {loading ? <TableSkeleton /> : (
            <div className="max-w-4xl mx-auto space-y-6">
                {list.map(ann => (
                    <div key={ann.id} className={`card bg-base-100 shadow-lg transition-all hover:translate-x-2 ${ann.isSticky ? 'border-l-4 border-brand-accent bg-brand-accent/5' : 'border border-gray-100 dark:border-gray-700'}`}>
                        <div className="card-body">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div>
                                    {ann.isSticky && (
                                        <div className="badge badge-accent text-white gap-1 mb-2 uppercase font-bold text-xs">
                                            <MapPinIcon className="w-3 h-3" /> Pinned
                                        </div>
                                    )}
                                    <h2 className="card-title text-xl font-bold text-brand-primary dark:text-white mb-2">{ann.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-300">{ann.description}</p>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 min-w-[100px]">
                                    <div className="badge badge-outline">{ann.category}</div>
                                    <span className="text-xs text-gray-400 font-mono">{ann.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};