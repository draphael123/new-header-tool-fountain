'use client';

import { useState, useRef, useCallback } from 'react';
import { DocumentType } from '@/lib/constants';
import { DocumentState } from '@/types';
import LetterheadSelector from '@/components/LetterheadSelector';
import FileUpload from '@/components/ui/FileUpload';
import LetterheadWarning from '@/components/ui/LetterheadWarning';
import RichTextEditor from '@/components/editor/RichTextEditor';
import DocumentPreview from '@/components/preview/DocumentPreview';
import { processPdfWithLetterhead } from '@/lib/pdf/pdfProcessor';
import { extractTextFromDocx } from '@/lib/docx/docxProcessor';
import { exportComposedPdf, downloadProcessedPdf } from '@/lib/export/exportPdf';
import { exportAsDocx } from '@/lib/export/exportDocx';

const initialState: DocumentState = {
  documentType: 'TRT',
  inputMode: 'compose',
  uploadedFile: null,
  uploadedFileName: '',
  editorContent: '',
  processedPdfBytes: null,
  extractedHtml: '',
  isProcessing: false,
  hasExistingLetterhead: false,
  overrideLetterhead: false,
  error: null,
};

export default function Home() {
  const [state, setState] = useState<DocumentState>(initialState);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateState = (updates: Partial<DocumentState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleDocumentTypeChange = (type: DocumentType) => {
    updateState({ documentType: type });
    // Re-process if we have an uploaded file
    if (state.uploadedFile && state.inputMode === 'upload') {
      processFile(state.uploadedFile, type);
    }
  };

  const handleInputModeChange = (mode: 'upload' | 'compose') => {
    updateState({
      inputMode: mode,
      processedPdfBytes: null,
      error: null,
    });
  };

  const processFile = async (file: File, docType: DocumentType = state.documentType) => {
    updateState({ isProcessing: true, error: null });

    try {
      const fileType = file.name.toLowerCase();

      if (fileType.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await processPdfWithLetterhead(arrayBuffer, {
          documentType: docType,
        });

        updateState({
          processedPdfBytes: result.pdfBytes,
          hasExistingLetterhead: result.hasExistingLetterhead,
          isProcessing: false,
        });
      } else if (fileType.endsWith('.docx') || fileType.endsWith('.doc')) {
        // Extract HTML from Word doc
        const html = await extractTextFromDocx(file);
        updateState({
          extractedHtml: html,
          editorContent: html,
          inputMode: 'compose', // Switch to compose mode with extracted content
          isProcessing: false,
        });
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or Word document.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to process document',
        isProcessing: false,
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    updateState({
      uploadedFile: file,
      uploadedFileName: file.name,
    });
    await processFile(file);
  };

  const handleFileClear = () => {
    updateState({
      uploadedFile: null,
      uploadedFileName: '',
      processedPdfBytes: null,
      extractedHtml: '',
      hasExistingLetterhead: false,
      error: null,
    });
  };

  const handleEditorChange = (html: string) => {
    updateState({ editorContent: html });
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    updateState({ isProcessing: true, error: null });

    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseFilename = `document-${state.documentType}-${timestamp}`;

      if (state.inputMode === 'upload' && state.processedPdfBytes) {
        if (format === 'pdf') {
          downloadProcessedPdf(state.processedPdfBytes, `${baseFilename}.pdf`);
        } else {
          // For Word export of uploaded PDF, we'd need to extract text first
          // This is a simplified implementation
          throw new Error('Word export is only available for composed documents');
        }
      } else if (state.inputMode === 'compose' && state.editorContent) {
        if (format === 'pdf') {
          const previewArea = previewRef.current?.querySelector('.flex.flex-col.gap-6');
          if (previewArea) {
            await exportComposedPdf(previewArea as HTMLElement, `${baseFilename}.pdf`);
          } else {
            throw new Error('Preview not available for export');
          }
        } else {
          await exportAsDocx(state.editorContent, state.documentType, `${baseFilename}.docx`);
        }
      } else {
        throw new Error('No content to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      updateState({ isProcessing: false });
    }
  };

  const hasContent =
    (state.inputMode === 'compose' && state.editorContent && state.editorContent !== '<p></p>') ||
    (state.inputMode === 'upload' && state.processedPdfBytes);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-fountain-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Fountain Letterhead Generator</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!hasContent || state.isProcessing}
                className="px-4 py-2 bg-fountain-teal-500 text-white rounded-lg hover:bg-fountain-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={!hasContent || state.isProcessing || state.inputMode === 'upload'}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Word
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6 overflow-y-auto">
            {/* Letterhead Type Selection */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <LetterheadSelector
                selected={state.documentType}
                onChange={handleDocumentTypeChange}
              />
            </div>

            {/* Input Mode Toggle */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Input Mode
              </label>
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => handleInputModeChange('compose')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    state.inputMode === 'compose'
                      ? 'bg-fountain-teal-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Compose
                </button>
                <button
                  onClick={() => handleInputModeChange('upload')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    state.inputMode === 'upload'
                      ? 'bg-fountain-teal-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              {state.inputMode === 'upload' ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Document
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isProcessing={state.isProcessing}
                    uploadedFile={state.uploadedFile}
                    uploadedFileName={state.uploadedFileName}
                    onClear={handleFileClear}
                  />
                  <LetterheadWarning
                    isVisible={state.hasExistingLetterhead && !state.overrideLetterhead}
                    onOverride={() => updateState({ overrideLetterhead: true })}
                    onCancel={handleFileClear}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Content
                  </label>
                  <RichTextEditor
                    content={state.editorContent}
                    onChange={handleEditorChange}
                  />
                </div>
              )}
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{state.error}</p>
                    <button
                      onClick={() => updateState({ error: null })}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden" ref={previewRef}>
            <DocumentPreview
              mode={state.inputMode}
              documentType={state.documentType}
              htmlContent={state.editorContent}
              processedPdfBytes={state.processedPdfBytes}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
