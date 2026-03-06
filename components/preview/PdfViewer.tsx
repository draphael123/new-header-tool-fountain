'use client';

import { useEffect, useState } from 'react';

interface PdfViewerProps {
  pdfBytes: Uint8Array;
}

export default function PdfViewer({ pdfBytes }: PdfViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a copy of the buffer to ensure compatibility
    const buffer = pdfBytes.slice().buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [pdfBytes]);

  if (!objectUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    );
  }

  return (
    <iframe
      src={objectUrl}
      className="w-full h-full border-0 rounded-lg bg-white"
      title="PDF Preview"
    />
  );
}
