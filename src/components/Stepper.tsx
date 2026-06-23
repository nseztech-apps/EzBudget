import React from 'react';
import { wizardSections } from '../config/wizardSections';

interface StepperProps {
  currentSection: number;
  completedSections: number[];
  onSectionClick: (index: number) => void;
}

export function Stepper({ currentSection, completedSections, onSectionClick }: StepperProps) {
  return (
    <>
      {/* Desktop stepper */}
      <nav className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-4 space-y-1">
          {wizardSections.map((section, index) => {
            const isCompleted = completedSections.includes(index);
            const isCurrent = index === currentSection;
            const isClickable = isCompleted;

            return (
              <button
                key={section.id}
                onClick={() => isClickable && onSectionClick(index)}
                disabled={!isClickable && !isCurrent}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                  isCurrent
                    ? 'bg-navy-900 text-white font-medium'
                    : isCompleted
                    ? 'bg-navy-50 text-navy-700 hover:bg-navy-100 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isCurrent
                    ? 'bg-white text-navy-900'
                    : isCompleted
                    ? 'bg-navy-200 text-navy-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span className="truncate">{section.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile stepper */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between px-2 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <span className="text-sm font-medium text-navy-900">
            {wizardSections[currentSection]?.icon} {wizardSections[currentSection]?.title}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {currentSection + 1} / {wizardSections.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
          {wizardSections.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSection
                  ? 'w-6 bg-navy-900'
                  : completedSections.includes(index)
                  ? 'w-1.5 bg-navy-400'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
