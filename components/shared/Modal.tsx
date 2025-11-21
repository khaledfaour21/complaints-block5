import React, { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-[50] bg-black/50 backdrop-blur-sm">
      <div className="modal-box relative max-w-2xl animate-fade-in-up bg-white dark:bg-[#1e1e1e] border border-brand-primary/10">
        <button 
          onClick={onClose} 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rtl:right-auto rtl:left-2"
        >
            <XMarkIcon className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-xl font-cairo mb-4 text-brand-primary dark:text-brand-accent">{title}</h3>
        <div className="py-4">
            {children}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};