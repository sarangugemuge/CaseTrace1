'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, maxWidth = 'max-w-lg', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4">
      <div className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl ${maxWidth} w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 transition-colors`}>
        <div className="bg-slate-100 dark:bg-navy-950 px-6 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
