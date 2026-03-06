'use client';

interface LetterheadWarningProps {
  isVisible: boolean;
  onOverride: () => void;
  onCancel: () => void;
}

export default function LetterheadWarning({
  isVisible,
  onOverride,
  onCancel,
}: LetterheadWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="font-medium text-amber-800">
            Possible Existing Letterhead Detected
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            This document may already contain a letterhead. Adding another
            letterhead could cause overlapping content.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onOverride}
              className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Apply Anyway
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm border border-amber-300 text-amber-700 rounded hover:bg-amber-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
