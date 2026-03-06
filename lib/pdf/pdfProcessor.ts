import { PDFDocument, rgb } from 'pdf-lib';
import { DocumentType, LETTERHEAD_CONFIG, PAGE_DIMENSIONS } from '../constants';
import { getLetterheadPng } from '../utils/svgToPng';

interface ProcessOptions {
  documentType: DocumentType;
}

interface ProcessResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  hasExistingLetterhead: boolean;
}

export async function processPdfWithLetterhead(
  pdfBytes: ArrayBuffer,
  options: ProcessOptions
): Promise<ProcessResult> {
  const { documentType } = options;
  const config = LETTERHEAD_CONFIG[documentType];

  // Load source PDF
  const srcDoc = await PDFDocument.load(pdfBytes);
  const pdfDoc = await PDFDocument.create();

  // Calculate image dimensions based on page size
  const pageWidth = PAGE_DIMENSIONS.WIDTH_PT;
  const headerHeight = Math.round((config.headerHeightPercent / 100) * PAGE_DIMENSIONS.HEIGHT_PT);
  const footerHeight = Math.round((config.footerHeightPercent / 100) * PAGE_DIMENSIONS.HEIGHT_PT);

  // Convert SVG letterheads to PNG at runtime
  const [headerBytes, footerBytes] = await Promise.all([
    getLetterheadPng(config.headerImage, pageWidth, headerHeight),
    getLetterheadPng(config.footerImage, pageWidth, footerHeight),
  ]);

  const headerImage = await pdfDoc.embedPng(headerBytes);
  const footerImage = await pdfDoc.embedPng(footerBytes);

  // Check for existing letterhead
  const hasExistingLetterhead = await detectExistingLetterhead(srcDoc);

  // Process each page
  const srcPages = srcDoc.getPages();
  const pageCount = srcPages.length;

  // Calculate dimensions
  const headerHeightPct = config.headerHeightPercent / 100;
  const footerHeightPct = config.footerHeightPercent / 100;

  for (let i = 0; i < srcPages.length; i++) {
    const srcPage = srcPages[i];
    const { width, height } = srcPage.getSize();

    // Create new page with same dimensions
    const newPage = pdfDoc.addPage([width, height]);

    // Calculate header/footer heights
    const headerHeight = height * headerHeightPct;
    const footerHeight = height * footerHeightPct;

    // Draw white background
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    // Embed and draw original page content
    const [embeddedPage] = await pdfDoc.embedPages([srcPage]);
    newPage.drawPage(embeddedPage, { x: 0, y: 0, width, height });

    // First page: add header + footer
    if (i === 0) {
      // Cover header area with white, then draw header image
      newPage.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
        color: rgb(1, 1, 1),
      });

      // Draw header image
      newPage.drawImage(headerImage, {
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
      });
    }

    // Add footer to all pages
    // Cover footer area
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerHeight,
      color: rgb(1, 1, 1),
    });

    // Draw footer image
    newPage.drawImage(footerImage, {
      x: 0,
      y: 0,
      width,
      height: footerHeight,
    });
  }

  return {
    pdfBytes: await pdfDoc.save(),
    pageCount,
    hasExistingLetterhead,
  };
}

async function detectExistingLetterhead(pdfDoc: PDFDocument): Promise<boolean> {
  // Simple heuristic: check if first page has significant content in header region
  // This is a basic check - can be enhanced with more sophisticated detection
  try {
    const firstPage = pdfDoc.getPages()[0];
    if (!firstPage) return false;

    // Check if the document has embedded images (common for letterheads)
    // This is a rough heuristic
    const pageRef = firstPage.ref;
    if (!pageRef) return false;

    // For now, return false and let user manually check
    // A more sophisticated implementation would analyze the page content
    return false;
  } catch {
    return false;
  }
}

export async function createPdfFromHtml(
  html: string,
  documentType: DocumentType
): Promise<Uint8Array> {
  // This function is used for composed documents
  // It relies on html2canvas + jsPDF which are handled in the export module
  throw new Error('Use exportComposedPdf for HTML content');
}
