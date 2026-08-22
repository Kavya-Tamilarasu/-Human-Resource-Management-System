import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast: React.FC = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100',
    error: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100',
    warning: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100',
    info: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-100'
  };

  return (
    <div
      id="dayflow-global-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${bgStyles[toast.type]}`}>
        {icons[toast.type]}
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </div>
      </div>
    </div>
  );
};
