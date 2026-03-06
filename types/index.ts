import { DocumentType } from '@/lib/constants';

export interface DocumentState {
  documentType: DocumentType;
  inputMode: 'upload' | 'compose';
  uploadedFile: File | null;
  uploadedFileName: string;
  editorContent: string;
  processedPdfBytes: Uint8Array | null;
  extractedHtml: string;
  isProcessing: boolean;
  hasExistingLetterhead: boolean;
  overrideLetterhead: boolean;
  error: string | null;
}

export interface PageContent {
  pageNumber: number;
  content: string;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface LetterheadDetectionResult {
  hasLetterhead: boolean;
  confidence: 'high' | 'medium' | 'low';
  details: string;
}

export interface ExportOptions {
  format: 'pdf' | 'docx';
  filename: string;
}
