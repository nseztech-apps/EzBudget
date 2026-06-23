import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className = '', showLabel = true }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const getColor = () => {
    if (clampedValue >= 80) return 'bg-green-500';
    if (clampedValue >= 60) return 'bg-amber-500';
    if (clampedValue >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Saúde Financeira</span>
          <span className="text-sm font-bold text-navy-900">{clampedValue}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
