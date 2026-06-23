import React from 'react';
import { QuestionConfig, QuestionAnswer, AnswerState } from '../types';
import { AnswerStateToggle } from './AnswerStateToggle';
import { DynamicList } from './DynamicList';

interface QuestionRendererProps {
  question: QuestionConfig;
  answer?: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const currentState: AnswerState = answer?.state || 'known';
  const currentValue = answer?.value;

  const handleStateChange = (state: AnswerState) => {
    onAnswerChange({
      questionId: question.id,
      state,
      value: currentValue,
    });
  };

  const handleValueChange = (value: string | number | boolean | string[]) => {
    onAnswerChange({
      questionId: question.id,
      state: currentState,
      value,
    });
  };

  // Dynamic list type
  if (question.inputType === 'dynamic-list' && question.dynamicListFields) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          {question.text}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-3">{question.helpText}</p>
        )}
        <DynamicList
          fields={question.dynamicListFields}
          value={(currentValue as string[]) || []}
          onChange={(items) => handleValueChange(items)}
        />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {question.text}
      </label>
      {question.helpText && (
        <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
      )}

      {question.supportsAnswerState && (
        <AnswerStateToggle value={currentState} onChange={handleStateChange} />
      )}

      {/* Only show input if state is 'known' or if no answer state support */}
      {(currentState === 'known' || !question.supportsAnswerState) && (
        <div className="mt-2">
          {renderInput(question, currentValue, handleValueChange)}
        </div>
      )}
    </div>
  );
}

function renderInput(
  question: QuestionConfig,
  value: string | number | boolean | string[] | undefined,
  onChange: (value: string | number | boolean | string[]) => void,
) {
  const inputClasses = 'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-300 focus:border-navy-500 transition-colors';

  switch (question.inputType) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={inputClasses}
          placeholder="Escreva aqui..."
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value !== undefined && value !== '' ? Number(value) : ''}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          min={question.validation?.min}
          max={question.validation?.max}
          className={inputClasses}
          placeholder="0"
        />
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">Selecionar...</option>
          {question.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'multi-select':
      return (
        <div className="space-y-2">
          {question.options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt.value)}
                onChange={e => {
                  const current = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...current, opt.value]);
                  } else {
                    onChange(current.filter(v => v !== opt.value));
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              value === true
                ? 'bg-navy-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              value === false
                ? 'bg-navy-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Não
          </button>
        </div>
      );

    case 'scale':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                value === n
                  ? 'bg-navy-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
}
