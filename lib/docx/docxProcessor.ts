import mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  ImageRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import { DocumentType, LETTERHEAD_CONFIG } from '../constants';
import { svgToArrayBuffer } from '../utils/svgToPng';

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function createDocxWithLetterhead(
  htmlContent: string,
  documentType: DocumentType
): Promise<Blob> {
  const config = LETTERHEAD_CONFIG[documentType];

  // Convert SVG letterheads to PNG at runtime
  let headerBuffer: ArrayBuffer | null = null;
  let footerBuffer: ArrayBuffer | null = null;

  try {
    [headerBuffer, footerBuffer] = await Promise.all([
      svgToArrayBuffer(config.headerImage, 600, 70),
      svgToArrayBuffer(config.footerImage, 600, 50),
    ]);
  } catch (error) {
    console.error('Failed to convert letterhead images:', error);
  }

  // Parse HTML content to document elements
  const contentParagraphs = parseHtmlToDocxElements(htmlContent);

  // Build header section
  const headerChildren: Paragraph[] = [];
  if (headerBuffer) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerBuffer,
            transformation: { width: 600, height: 70 },
          }),
        ],
      })
    );
  }

  // Build footer section
  const footerChildren: Paragraph[] = [];
  if (footerBuffer) {
    footerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: footerBuffer,
            transformation: { width: 600, height: 50 },
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: headerBuffer
          ? {
              default: new Header({
                children: headerChildren,
              }),
            }
          : undefined,
        footers: footerBuffer
          ? {
              default: new Footer({
                children: footerChildren,
              }),
            }
          : undefined,
        children: contentParagraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function parseHtmlToDocxElements(html: string): Paragraph[] {
  if (typeof document === 'undefined') {
    // Server-side fallback
    return [new Paragraph({ children: [new TextRun(html)] })];
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  const paragraphs: Paragraph[] = [];

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toUpperCase();

      if (tagName === 'H1') {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: parseInlineContent(el),
          })
        );
      } else if (tagName === 'H2') {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: parseInlineContent(el),
          })
        );
      } else if (tagName === 'H3') {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: parseInlineContent(el),
          })
        );
      } else if (tagName === 'P') {
        const alignment = getAlignment(el);
        paragraphs.push(
          new Paragraph({
            alignment,
            children: parseInlineContent(el),
          })
        );
      } else if (tagName === 'UL' || tagName === 'OL') {
        el.querySelectorAll('li').forEach((li) => {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              children: parseInlineContent(li),
            })
          );
        });
      } else if (tagName === 'DIV') {
        el.childNodes.forEach(processNode);
      } else {
        // Default: treat as paragraph
        if (el.textContent?.trim()) {
          paragraphs.push(
            new Paragraph({
              children: parseInlineContent(el),
            })
          );
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(text)],
          })
        );
      }
    }
  };

  div.childNodes.forEach(processNode);

  return paragraphs.length > 0
    ? paragraphs
    : [new Paragraph({ children: [new TextRun('')] })];
}

function parseInlineContent(element: Element): TextRun[] {
  const runs: TextRun[] = [];

  const processInline = (node: Node, formatting: { bold?: boolean; italic?: boolean; underline?: boolean }) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: formatting.bold,
            italics: formatting.italic,
            underline: formatting.underline ? {} : undefined,
          })
        );
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const newFormatting = { ...formatting };

      if (el.tagName === 'STRONG' || el.tagName === 'B') {
        newFormatting.bold = true;
      }
      if (el.tagName === 'EM' || el.tagName === 'I') {
        newFormatting.italic = true;
      }
      if (el.tagName === 'U') {
        newFormatting.underline = true;
      }

      el.childNodes.forEach((child) => processInline(child, newFormatting));
    }
  };

  element.childNodes.forEach((child) => processInline(child, {}));

  return runs.length > 0 ? runs : [new TextRun('')];
}

function getAlignment(element: Element): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const style = (element as HTMLElement).style?.textAlign;
  switch (style) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}
