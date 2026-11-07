/** Longest side of a picture sent with a suggestion */
export const MAX_IMAGE_SIDE = 1280;
const IMAGE_QUALITY = 0.8;

/** A picture's size scaled down to fit `max` on its longest side, never scaled up */
export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Redraws a chosen picture smaller, as WebP (JPEG where the browser can't write WebP). Redrawing keeps only the
 * pixels, so camera, date and location metadata never leave the device. The API cleans pictures again anyway.
 */
export async function shrinkImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, IMAGE_QUALITY));
  const webp = await toBlob('image/webp');
  const blob = webp?.type === 'image/webp' ? webp : await toBlob('image/jpeg');
  if (!blob) {
    throw new Error('The picture could not be read');
  }
  return blob;
}
