import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquarePlus } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  let questions: string[] = [];

  if (user.role === 'employee') {
    questions = [
      "What's my attendance this month?",
      "How many leaves do I have remaining?",
      "Show my recent leave requests",
      "Show my latest payslip"
    ];
  } else if (user.role === 'hr') {
    questions = [
      "How many employees are currently on leave?",
      "Show this month's payroll summary",
      "How many employees are in the organization?",
      "Give me the attendance summary"
    ];
  } else if (user.role === 'admin') {
    questions = [
      "How many employees are in the organization?",
      "Show department-wise employee distribution",
      "Show attendance statistics",
      "Show payroll summary"
    ];
  }

  return (
    <div className="flex flex-col gap-2 mt-4 px-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
        <MessageSquarePlus className="w-3.5 h-3.5" />
        Suggested Questions
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
