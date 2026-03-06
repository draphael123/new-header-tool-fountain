'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { ACCEPTED_FILE_TYPES } from '@/lib/constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  uploadedFile: File | null;
  uploadedFileName: string;
  onClear: () => void;
}

export default function FileUpload({
  onFileSelect,
  isProcessing,
  uploadedFile,
  uploadedFileName,
  onClear,
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          isDragActive && 'border-fountain-teal-500 bg-fountain-teal-50',
          uploadedFile && !isDragActive && 'border-fountain-teal-500 bg-fountain-teal-50',
          !isDragActive && !uploadedFile && 'border-gray-300 hover:border-fountain-teal-400 hover:bg-gray-50',
          isProcessing && 'opacity-50 cursor-wait'
        )}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-fountain-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Processing document...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-fountain-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-fountain-teal-700 font-medium">{uploadedFileName}</span>
            <span className="text-xs text-gray-500">Drop a new file to replace</span>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-fountain-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-fountain-teal-600 font-medium">Drop the file here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">Drop PDF or Word file here</p>
            <p className="text-xs text-gray-400">or click to browse</p>
          </div>
        )}
      </div>
      {uploadedFile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Clear file
        </button>
      )}
    </div>
  );
}
