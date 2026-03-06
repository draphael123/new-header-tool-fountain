export const LETTERHEAD_CONFIG = {
  TRT: {
    name: 'TRT',
    displayName: 'TRT Letterhead',
    description: 'Teal/Turquoise theme',
    accentColor: '#00B5B8',
    headerImage: '/letterheads/trt-header.svg',
    footerImage: '/letterheads/trt-footer.svg',
    fullImage: '/letterheads/trt-full.svg',
    headerHeightPercent: 12,
    footerHeightPercent: 10,
  },
  HRT: {
    name: 'HRT',
    displayName: 'HRT Letterhead',
    description: 'Pink/Magenta theme',
    accentColor: '#E91E8C',
    headerImage: '/letterheads/hrt-header.svg',
    footerImage: '/letterheads/hrt-footer.svg',
    fullImage: '/letterheads/hrt-full.svg',
    headerHeightPercent: 16,
    footerHeightPercent: 10,
  },
} as const;

export type DocumentType = keyof typeof LETTERHEAD_CONFIG;

export const PAGE_DIMENSIONS = {
  WIDTH_PT: 612,   // US Letter width in points (8.5 inches * 72)
  HEIGHT_PT: 792,  // US Letter height in points (11 inches * 72)
  WIDTH_PX: 816,   // Render width in pixels
  HEIGHT_PX: 1056, // Render height in pixels
  MARGIN_X_PERCENT: 8,
  MARGIN_Y_PERCENT: 5,
};

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};
