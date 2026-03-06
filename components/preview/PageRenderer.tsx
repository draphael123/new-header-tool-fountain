'use client';

import { LETTERHEAD_CONFIG, DocumentType } from '@/lib/constants';

interface PageRendererProps {
  pageNumber: number;
  totalPages: number;
  content: string;
  documentType: DocumentType;
  showHeader: boolean;
  showFooter: boolean;
}

export default function PageRenderer({
  pageNumber,
  totalPages,
  content,
  documentType,
  showHeader,
  showFooter,
}: PageRendererProps) {
  const config = LETTERHEAD_CONFIG[documentType];

  return (
    <div
      className="relative bg-white shadow-lg page-preview"
      data-page={pageNumber}
      style={{
        width: '100%',
        aspectRatio: '8.5 / 11',
      }}
    >
      {/* Header - First page only */}
      {showHeader && (
        <div
          className="absolute top-0 left-0 right-0 overflow-hidden"
          style={{ height: `${config.headerHeightPercent}%` }}
        >
          <img
            src={config.headerImage}
            alt="Header"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              // Fallback if image not found - show colored bar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.backgroundColor = config.accentColor;
              target.parentElement!.style.opacity = '0.1';
            }}
          />
        </div>
      )}

      {/* Content Area */}
      <div
        className="absolute left-[8%] right-[8%] overflow-hidden"
        style={{
          top: showHeader ? `${config.headerHeightPercent + 2}%` : '5%',
          bottom: showFooter ? `${config.footerHeightPercent + 2}%` : '5%',
        }}
      >
        <div
          className="prose prose-sm max-w-none text-gray-800"
          style={{ fontSize: '10px', lineHeight: '1.4' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Footer */}
      {showFooter && (
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{ height: `${config.footerHeightPercent}%` }}
        >
          <img
            src={config.footerImage}
            alt="Footer"
            className="w-full h-full object-cover object-bottom"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.backgroundColor = config.accentColor;
              target.parentElement!.style.opacity = '0.1';
            }}
          />
        </div>
      )}

      {/* Page number indicator */}
      {totalPages > 1 && (
        <div className="absolute bottom-1 right-2 text-[8px] text-gray-400 z-10">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
}
