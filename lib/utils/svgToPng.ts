'use client';

/**
 * Converts an SVG file to PNG data
 * @param svgUrl - URL of the SVG file
 * @param width - Desired width of the output PNG
 * @param height - Desired height of the output PNG
 * @returns Promise<Uint8Array> - PNG data as Uint8Array
 */
export async function svgToPng(
  svgUrl: string,
  width: number = 612,
  height: number = 100
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw the SVG image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to PNG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            resolve(new Uint8Array(arrayBuffer));
          };
          reader.onerror = () => reject(new Error('Failed to read blob'));
          reader.readAsArrayBuffer(blob);
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      reject(new Error(`Failed to load SVG: ${svgUrl}`));
    };

    img.src = svgUrl;
  });
}

/**
 * Converts an SVG file to PNG ArrayBuffer (for docx library)
 */
export async function svgToArrayBuffer(
  svgUrl: string,
  width: number = 612,
  height: number = 100
): Promise<ArrayBuffer> {
  const pngData = await svgToPng(svgUrl, width, height);
  return pngData.buffer as ArrayBuffer;
}

/**
 * Cache for converted PNG images
 */
const pngCache: Map<string, Uint8Array> = new Map();

/**
 * Gets PNG data for a letterhead image, with caching
 */
export async function getLetterheadPng(
  svgUrl: string,
  width: number,
  height: number
): Promise<Uint8Array> {
  const cacheKey = `${svgUrl}-${width}-${height}`;

  if (pngCache.has(cacheKey)) {
    return pngCache.get(cacheKey)!;
  }

  const pngData = await svgToPng(svgUrl, width, height);
  pngCache.set(cacheKey, pngData);
  return pngData;
}
