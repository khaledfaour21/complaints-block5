import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLangStore } from '../../store';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  const { t } = useLangStore();

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-[60] bg-black/60">
      <div className="modal-box max-w-md text-center bg-white dark:bg-[#1e1e1e]">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${type === 'danger' ? 'bg-red-100 sm:h-10 sm:w-10' : 'bg-blue-100'}`}>
          <ExclamationTriangleIcon className={`h-6 w-6 ${type === 'danger' ? 'text-red-600' : 'text-blue-600'}`} aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4">{title}</h3>
        <p className="py-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <div className="modal-action justify-center gap-4 mt-6">
          <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-error text-white' : 'btn-primary text-white'}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};