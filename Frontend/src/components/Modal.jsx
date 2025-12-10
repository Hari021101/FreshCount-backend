import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className="relative bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-lg transform transition-all border border-[var(--border-color)] max-h-[90vh] overflow-y-auto"
        role="dialog"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--card-bg)] z-10">
          <h3 className="text-xl font-semibold text-slate-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
