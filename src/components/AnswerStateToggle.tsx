import React from 'react';
import { AnswerState } from '../types';

interface AnswerStateToggleProps {
  value: AnswerState;
  onChange: (state: AnswerState) => void;
}

const stateOptions: { value: AnswerState; label: string; icon: string }[] = [
  { value: 'known', label: 'Sei a resposta', icon: '✓' },
  { value: 'unknown', label: 'Não sei agora', icon: '?' },
  { value: 'pending_confirmation', label: 'Preciso confirmar', icon: '⏳' },
];

export function AnswerStateToggle({ value, onChange }: AnswerStateToggleProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {stateOptions.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
            value === option.value
              ? option.value === 'known'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : option.value === 'unknown'
                ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                : 'bg-amber-100 text-amber-800 border-2 border-amber-300'
              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {option.icon} {option.label}
        </button>
      ))}
    </div>
  );
}
