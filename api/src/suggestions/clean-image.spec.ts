import sharp from 'sharp';
import { cleanImage } from './clean-image.js';

/** A small JPEG carrying camera and location metadata */
async function photoWithMetadata(width = 40, height = 20): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: '#3366ff' },
  })
    .withExif({
      IFD0: { Make: 'Camera', Model: 'Phone' },
      IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '43/1 15/1 0/1' },
    })
    .jpeg()
    .toBuffer();
}

describe('cleanImage', () => {
  it('re-encodes as WebP without any metadata', async () => {
    const original = await photoWithMetadata();
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const cleaned = await sharp(await cleanImage(original)).metadata();
    expect(cleaned.format).toBe('webp');
    expect(cleaned.exif).toBeUndefined();
    expect([cleaned.width, cleaned.height]).toEqual([40, 20]);
  });

  it('shrinks large pictures to 1600 px at most', async () => {
    const cleaned = await sharp(
      await cleanImage(await photoWithMetadata(3200, 800)),
    ).metadata();
    expect([cleaned.width, cleaned.height]).toEqual([1600, 400]);
  });

  it('rejects pictures that would unpack into too many pixels', async () => {
    // A plain 8000 × 6000 PNG: a small file, but 48 million pixels once decoded
    const huge = await sharp({
      create: { width: 8000, height: 6000, channels: 3, background: '#000' },
    })
      .png()
      .toBuffer();
    await expect(cleanImage(huge)).rejects.toThrow(/JPEG, PNG or WebP/);
  });

  it('rejects anything that is not a picture', async () => {
    await expect(cleanImage(Buffer.from('not a picture'))).rejects.toThrow(
      /JPEG, PNG or WebP/,
    );
  });
});
