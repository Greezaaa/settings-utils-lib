import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const MAX_SIDE = 1600;
const ACCEPTED_FORMATS = ['jpeg', 'png', 'webp'];
const MAX_INPUT_PIXELS = 40_000_000;

export async function cleanImage(input: Buffer, maxSide = MAX_SIDE): Promise<Buffer> {
  try {
    const image = sharp(input, {
      failOn: 'error',
      limitInputPixels: MAX_INPUT_PIXELS,
    });
    const { format } = await image.metadata();
    if (!format || !ACCEPTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    return await image
      .rotate()
      .resize({
        width: maxSide,
        height: maxSide,
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
