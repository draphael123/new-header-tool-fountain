import { DocumentType, LETTERHEAD_CONFIG } from '../constants';
import { PageContent } from '@/types';

// Approximate characters per page based on letterhead space usage
const CHARS_PER_PAGE_FIRST = {
  TRT: 1800,
  HRT: 1600,
};
const CHARS_PER_PAGE_SUBSEQUENT = 2100;

export function paginateHtmlContent(
  html: string,
  documentType: DocumentType
): PageContent[] {
  if (!html || html === '<p></p>' || html.trim() === '') {
    return [];
  }

  // Create a temporary div to parse HTML
  if (typeof document === 'undefined') {
    // Server-side: return single page
    return [{
      pageNumber: 1,
      content: html,
      isFirstPage: true,
      isLastPage: true,
    }];
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  const plainText = div.textContent || '';

  const charsFirstPage = CHARS_PER_PAGE_FIRST[documentType];

  // If content fits on one page
  if (plainText.length <= charsFirstPage) {
    return [{
      pageNumber: 1,
      content: html,
      isFirstPage: true,
      isLastPage: true,
    }];
  }

  // Split content into multiple pages
  const pages: PageContent[] = [];
  let remainingHtml = html;
  let pageNum = 1;

  while (remainingHtml.trim().length > 0 && remainingHtml !== '<p></p>') {
    const isFirst = pageNum === 1;
    const charsForPage = isFirst ? charsFirstPage : CHARS_PER_PAGE_SUBSEQUENT;

    const { pageContent, remaining } = splitHtmlAtCharLimit(remainingHtml, charsForPage);

    if (pageContent.trim().length === 0) break;

    pages.push({
      pageNumber: pageNum,
      content: pageContent,
      isFirstPage: isFirst,
      isLastPage: remaining.trim().length === 0 || remaining === '<p></p>',
    });

    remainingHtml = remaining;
    pageNum++;

    // Safety limit
    if (pageNum > 50) break;
  }

  // Update last page flag
  if (pages.length > 0) {
    pages[pages.length - 1].isLastPage = true;
  }

  return pages;
}

function splitHtmlAtCharLimit(
  html: string,
  charLimit: number
): { pageContent: string; remaining: string } {
  if (typeof document === 'undefined') {
    return { pageContent: html, remaining: '' };
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  let charCount = 0;
  let splitIndex = 0;
  const children = Array.from(div.children);

  if (children.length === 0) {
    // Plain text without structure
    const text = div.textContent || '';
    if (text.length <= charLimit) {
      return { pageContent: html, remaining: '' };
    }
    // Split at word boundary
    const splitPoint = text.lastIndexOf(' ', charLimit);
    const actualSplit = splitPoint > 0 ? splitPoint : charLimit;
    return {
      pageContent: `<p>${text.substring(0, actualSplit)}</p>`,
      remaining: `<p>${text.substring(actualSplit).trim()}</p>`,
    };
  }

  for (let i = 0; i < children.length; i++) {
    const childText = children[i].textContent || '';
    if (charCount + childText.length > charLimit && i > 0) {
      splitIndex = i;
      break;
    }
    charCount += childText.length;
    splitIndex = i + 1;
  }

  // If we haven't split anywhere, take at least one element
  if (splitIndex === 0 && children.length > 0) {
    splitIndex = 1;
  }

  const pageChildren = children.slice(0, splitIndex);
  const remainingChildren = children.slice(splitIndex);

  const pageDiv = document.createElement('div');
  pageChildren.forEach((c) => pageDiv.appendChild(c.cloneNode(true)));

  const remainingDiv = document.createElement('div');
  remainingChildren.forEach((c) => remainingDiv.appendChild(c.cloneNode(true)));

  return {
    pageContent: pageDiv.innerHTML,
    remaining: remainingDiv.innerHTML,
  };
}
