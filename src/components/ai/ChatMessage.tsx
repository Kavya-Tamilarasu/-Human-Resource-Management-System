import React from 'react';
import { User, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isAi: boolean;
    timestamp: Date;
    actionType?: string;
  };
  onNavigate?: (tab: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onNavigate }) => {
  const { user } = useAuth();
  
  const handleActionClick = () => {
    if (onNavigate && message.actionType) {
      onNavigate(message.actionType);
    }
  };

  const getActionLabel = (type: string) => {
    switch(type) {
      case 'attendance': return 'View Attendance';
      case 'leaves': return 'View Leaves';
      case 'payroll': return 'View Payroll';
      case 'employees': return 'View Directory';
      case 'analytics': return 'View Analytics';
      default: return 'View Details';
    }
  };

  return (
    <div className={`flex w-full gap-3 ${message.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="flex-shrink-0 mt-1">
        {message.isAi ? (
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
      
      <div className={`flex flex-col max-w-[80%] ${message.isAi ? 'items-start' : 'items-end'}`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl text-sm ${
            message.isAi 
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm' 
              : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {/* Extremely basic markdown bold parser for **text** */}
          {message.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
        
        {message.isAi && message.actionType && (
          <button 
            onClick={handleActionClick}
            className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition"
          >
            {getActionLabel(message.actionType)}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
        
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
