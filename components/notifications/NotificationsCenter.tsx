import React from 'react';
import { useNotificationStore, useLangStore } from '../../store';
import { BellIcon, TrashIcon, CheckIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

export const NotificationsCenter: React.FC = () => {
  const { notifications, markAsRead, deleteNotification, clearAll } = useNotificationStore();
  const { t } = useLangStore();

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent flex items-center gap-2">
            <BellIcon className="w-8 h-8" /> {t('notif.title')}
        </h1>
        {notifications.length > 0 && (
            <button onClick={clearAll} className="btn btn-ghost btn-sm text-error">Clear All</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-base-100 rounded-xl border border-dashed border-gray-300">
            <BellIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('notif.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
            {notifications.map(notif => (
                <div key={notif.id} className={`card bg-base-100 shadow-sm border-l-4 transition-all ${notif.read ? 'border-gray-300 opacity-70' : 'border-brand-accent'}`}>
                    <div className="card-body p-4 flex flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <h3 className={`font-bold ${notif.read ? 'text-gray-500' : 'text-brand-primary'}`}>{notif.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                            <span className="text-xs text-gray-400 mt-2 block">{new Date(notif.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {!notif.read && (
                                <button onClick={() => markAsRead(notif.id)} className="btn btn-xs btn-circle btn-ghost text-success" title="Mark read">
                                    <CheckIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => deleteNotification(notif.id)} className="btn btn-xs btn-circle btn-ghost text-error" title="Delete">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};