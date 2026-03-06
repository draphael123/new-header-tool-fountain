'use client';

import { useState, useMemo } from 'react';
import PageRenderer from './PageRenderer';
import PdfViewer from './PdfViewer';
import { DocumentType } from '@/lib/constants';
import { paginateHtmlContent } from '@/lib/utils/pagination';

interface DocumentPreviewProps {
  mode: 'compose' | 'upload';
  documentType: DocumentType;
  htmlContent?: string;
  processedPdfBytes?: Uint8Array | null;
}

export default function DocumentPreview({
  mode,
  documentType,
  htmlContent,
  processedPdfBytes,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1);

  const pages = useMemo(() => {
    if (mode === 'compose' && htmlContent) {
      return paginateHtmlContent(htmlContent, documentType);
    }
    return [];
  }, [mode, htmlContent, documentType]);

  // For composed content, render paginated HTML
  if (mode === 'compose') {
    return (
      <div className="flex flex-col h-full">
        {/* Preview Controls */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 border-b sticky top-0 z-10">
          <span className="text-sm text-gray-600">
            <span className="font-medium">{documentType}</span> Letterhead
            {pages.length > 0 && (
              <span className="text-gray-400 ml-2">
                {pages.length} page{pages.length !== 1 ? 's' : ''}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400">Zoom:</span>
            {[0.5, 0.75, 1].map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  zoom === z
                    ? 'bg-fountain-teal-100 text-fountain-teal-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {z * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          {pages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Start typing to see preview</p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col gap-6 mx-auto transition-all duration-200"
              style={{
                width: `${400 * zoom}px`,
              }}
            >
              {pages.map((page) => (
                <PageRenderer
                  key={page.pageNumber}
                  pageNumber={page.pageNumber}
                  totalPages={pages.length}
                  content={page.content}
                  documentType={documentType}
                  showHeader={page.isFirstPage}
                  showFooter={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // For uploaded PDFs, show in iframe viewer
  if (mode === 'upload' && processedPdfBytes) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 p-3 bg-gray-50 border-b">
          <span className="text-sm text-gray-600">
            <span className="font-medium">{documentType}</span> Letterhead Applied
          </span>
        </div>
        <div className="flex-1 p-4 bg-gray-100">
          <PdfViewer pdfBytes={processedPdfBytes} />
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Upload a document or start composing</p>
        <p className="text-sm mt-1">to see the preview</p>
      </div>
    </div>
  );
}
