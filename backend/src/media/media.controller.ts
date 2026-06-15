import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';
import sharp from 'sharp';

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e0e0e0"/><text x="400" y="280" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="24">Imagen no disponible</text><text x="400" y="320" text-anchor="middle" fill="#bbb" font-family="sans-serif" font-size="16">La imagen ha expirado o no pudo cargarse</text></svg>`;

@ApiTags('media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get('proxy')
  @ApiOperation({ summary: 'Proxy de imágenes desde DB o CDN externo' })
  @ApiQuery({ name: 'id', required: false, type: Number })
  @ApiQuery({ name: 'url', required: false, type: String })
  @ApiQuery({ name: 'w', required: false, type: Number })
  async proxy(
    @Query('id') id: string | undefined,
    @Query('url') url: string | undefined,
    @Query('w') w: string | undefined,
    @Res() res: Response,
  ) {
    const width = w ? Math.min(parseInt(w, 10) || 1200, 1920) : undefined;

    if (id) {
      try {
        const media = await this.mediaService.findById(+id);
        if (width) {
          const webp = await sharp(media.data)
            .resize(width, undefined, { withoutEnlargement: true, fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();
          res.set({
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(webp);
        } else {
          res.set({
            'Content-Type': media.mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(media.data);
        }
      } catch {
        this.servePlaceholder(res);
      }
      return;
    }

    if (!url) {
      this.servePlaceholder(res);
      return;
    }

    try {
      const decoded = decodeURIComponent(url);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const cdnResponse = await fetch(decoded, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
          Referer: 'https://www.instagram.com/',
        },
      });
      clearTimeout(timeout);

      if (!cdnResponse.ok) {
        this.logger.warn(`CDN responded ${cdnResponse.status} for ${url}, serving placeholder`);
        this.servePlaceholder(res);
        return;
      }

      const contentType = cdnResponse.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await cdnResponse.arrayBuffer());

      if (width && contentType.startsWith('image/')) {
        const webp = await sharp(buffer)
          .resize(width, undefined, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80 })
          .toBuffer();
        res.set({
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Length': webp.length,
        });
        res.end(webp);
      } else {
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'Content-Length': buffer.length,
        });
        res.end(buffer);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.logger.warn(`Proxy timeout for ${url}`);
      } else {
        this.logger.error(`Proxy error for ${url}: ${err.message}`);
      }
      this.servePlaceholder(res);
    }
  }

  private servePlaceholder(res: Response) {
    const buf = Buffer.from(PLACEHOLDER_SVG);
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'Content-Length': buf.length,
    });
    res.status(502).end(buf);
  }
}
