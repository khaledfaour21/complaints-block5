import React from 'react';
import { useToastStore } from '../../store';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`alert ${
            toast.type === 'success' ? 'alert-success text-white' : 
            toast.type === 'error' ? 'alert-error text-white' : 
            toast.type === 'warning' ? 'alert-warning' : 'alert-info text-white'
          } shadow-lg min-w-[300px] animate-fade-in-up`}
        >
          <div className="flex items-center gap-2 w-full">
            {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6" />}
            {toast.type === 'error' && <ExclamationCircleIcon className="w-6 h-6" />}
            {toast.type === 'warning' && <ExclamationCircleIcon className="w-6 h-6" />}
            {toast.type === 'info' && <InformationCircleIcon className="w-6 h-6" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="btn btn-ghost btn-xs btn-circle">
                <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};