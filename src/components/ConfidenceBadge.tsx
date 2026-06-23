import React from 'react';
import { ConfidenceLevel } from '../types';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  className?: string;
}

const confidenceStyles: Record<ConfidenceLevel, string> = {
  'Alta confiança': 'bg-green-100 text-green-700 border-green-200',
  'Confiança média': 'bg-amber-100 text-amber-700 border-amber-200',
  'Baixa confiança — dados em falta': 'bg-gray-100 text-gray-600 border-gray-200',
};

export function ConfidenceBadge({ confidence, className = '' }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${confidenceStyles[confidence]} ${className}`}
    >
      {confidence}
    </span>
  );
}
