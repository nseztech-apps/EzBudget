import React, { useState } from 'react';
import { QuestionConfig } from '../types';

interface DynamicListProps {
  fields: QuestionConfig[];
  value: string[];
  onChange: (items: string[]) => void;
}

export function DynamicList({ fields, value, onChange }: DynamicListProps) {
  const [items, setItems] = useState<Record<string, string>[]>(() => {
    try {
      return value.map(v => JSON.parse(v));
    } catch {
      return [];
    }
  });

  const addItem = () => {
    const newItem: Record<string, string> = {};
    fields.forEach(f => { newItem[f.id] = ''; });
    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated.map(i => JSON.stringify(i)));
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated.map(i => JSON.stringify(i)));
  };

  const updateItem = (index: number, fieldId: string, fieldValue: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [fieldId]: fieldValue };
    setItems(updated);
    onChange(updated.map(i => JSON.stringify(i)));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Remover"
          >
            ×
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {field.text}
                </label>
                {field.inputType === 'select' && field.options ? (
                  <select
                    value={item[field.id] || ''}
                    onChange={e => updateItem(index, field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-300 focus:border-navy-500"
                  >
                    <option value="">Selecionar...</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.inputType === 'boolean' ? (
                  <select
                    value={item[field.id] || ''}
                    onChange={e => updateItem(index, field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-300 focus:border-navy-500"
                  >
                    <option value="">Selecionar...</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                ) : field.inputType === 'number' ? (
                  <input
                    type="number"
                    value={item[field.id] || ''}
                    onChange={e => updateItem(index, field.id, e.target.value)}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-300 focus:border-navy-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.id] || ''}
                    onChange={e => updateItem(index, field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-300 focus:border-navy-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-navy-400 hover:text-navy-600 transition-colors text-sm font-medium min-h-[44px]"
      >
        + Adicionar entrada
      </button>
    </div>
  );
}
