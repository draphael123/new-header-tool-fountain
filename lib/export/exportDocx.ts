'use client';

import { createDocxWithLetterhead } from '../docx/docxProcessor';
import { DocumentType } from '../constants';

export async function exportAsDocx(
  content: string,
  documentType: DocumentType,
  filename: string
): Promise<void> {
  const blob = await createDocxWithLetterhead(content, documentType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
