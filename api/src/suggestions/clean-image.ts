import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

/** Largest upload accepted; the games site shrinks pictures well below this before sending */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
/** Longest side of a stored picture */
const MAX_SIDE = 1600;
const ACCEPTED_FORMATS = ['jpeg', 'png', 'webp'];

/**
 * Re-encodes an uploaded picture as WebP: turned upright, no larger than 1600 px, and without any metadata
 * (camera, date, location), whatever the browser sent. Rejects anything that isn't a JPEG, PNG or WebP picture.
 */
export async function cleanImage(input: Buffer): Promise<Buffer> {
  try {
    const image = sharp(input, { failOn: 'error' });
    const { format } = await image.metadata();
    if (!format || !ACCEPTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    // sharp writes no metadata unless asked to, so EXIF and location are dropped here
    return await image
      .rotate()
      .resize({
        width: MAX_SIDE,
        height: MAX_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new BadRequestException(
      'The image must be a JPEG, PNG or WebP picture',
    );
  }
}
