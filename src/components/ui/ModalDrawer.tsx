import React from 'react';
import { X } from 'lucide-react';

interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const ModalDrawer: React.FC<ModalDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full ${widthClass} bg-white border border-[#DDE3EA] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 bg-[#00305D] text-white">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-white">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-blue-200 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-blue-100 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 bg-[#F4F6F8] text-slate-800">{children}</div>
      </div>
    </div>
  );
};
