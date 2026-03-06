'use client';

import clsx from 'clsx';
import { LETTERHEAD_CONFIG, DocumentType } from '@/lib/constants';

interface LetterheadSelectorProps {
  selected: DocumentType;
  onChange: (type: DocumentType) => void;
}

export default function LetterheadSelector({ selected, onChange }: LetterheadSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Letterhead Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(LETTERHEAD_CONFIG) as DocumentType[]).map((type) => {
          const config = LETTERHEAD_CONFIG[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={clsx(
                'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                isSelected
                  ? type === 'TRT'
                    ? 'border-fountain-teal-500 bg-fountain-teal-50'
                    : 'border-fountain-pink-500 bg-fountain-pink-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <div
                className="w-8 h-8 rounded-full mb-2"
                style={{ backgroundColor: config.accentColor }}
              />
              <span className={clsx(
                'font-medium',
                isSelected
                  ? type === 'TRT' ? 'text-fountain-teal-700' : 'text-fountain-pink-700'
                  : 'text-gray-700'
              )}>
                {config.name}
              </span>
              <span className="text-xs text-gray-500">{config.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
