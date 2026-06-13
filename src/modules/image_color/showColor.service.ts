import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ShowColorService {
  private readonly fallbackColor = {
    r: 128,
    g: 128,
    b: 128,
    a: 255,
  };

  async getAverageColorFromUrl(imageUrl: string) {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.warn(`Image fetch failed (${response.status}): ${imageUrl}`);
        return this.formatColor(this.fallbackColor);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data } = await sharp(buffer)
        .resize(1, 1, { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const [r, g, b, a = 255] = data;

      return this.formatColor({ r, g, b, a });
    } catch (err) {
      // covers: network errors, timeouts, sharp failures, invalid images, etc.
      console.warn(`Color extraction failed for ${imageUrl}`, err);
      return this.formatColor(this.fallbackColor);
    }
  }

  private formatColor({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
    return {
      r,
      g,
      b,
      a,
      hex: `#${r.toString(16).padStart(2, '0')}${g
        .toString(16)
        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
    };
  }
}