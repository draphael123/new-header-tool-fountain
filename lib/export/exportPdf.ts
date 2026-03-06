'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportComposedPdf(
  previewElement: HTMLElement,
  filename: string
): Promise<void> {
  const pages = previewElement.querySelectorAll('[data-page]');

  if (pages.length === 0) {
    throw new Error('No pages to export');
  }

  const pdf = new jsPDF('p', 'pt', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i] as HTMLElement;

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
  }

  pdf.save(filename);
}

export function downloadProcessedPdf(
  pdfBytes: Uint8Array,
  filename: string
): void {
  // Create a copy of the buffer to ensure compatibility
  const buffer = pdfBytes.slice().buffer as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
