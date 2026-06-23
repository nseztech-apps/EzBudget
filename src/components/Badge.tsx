import React from 'react';
import { Classification } from '../types';

interface BadgeProps {
  classification: Classification;
  className?: string;
}

const classificationStyles: Record<Classification, string> = {
  'OK': 'bg-green-100 text-green-800 border-green-200',
  'Review': 'bg-amber-100 text-amber-800 border-amber-200',
  'Strong Cut Candidate': 'bg-orange-100 text-orange-800 border-orange-200',
  'Critical Leak': 'bg-red-100 text-red-800 border-red-200',
};

const classificationLabels: Record<Classification, string> = {
  'OK': 'OK',
  'Review': 'A Rever',
  'Strong Cut Candidate': 'Forte Candidato a Corte',
  'Critical Leak': 'Fuga Crítica',
};

export function Badge({ classification, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${classificationStyles[classification]} ${className}`}
    >
      {classificationLabels[classification]}
    </span>
  );
}
