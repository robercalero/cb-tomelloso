import { Controller, Get, Query, Res, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  @Get('proxy')
  @ApiOperation({ summary: 'Proxy de imágenes de CDN externos (Instagram, etc.)' })
  @ApiQuery({ name: 'url', required: true, type: String })
  async proxy(@Query('url') url: string, @Res() res: Response) {
    if (!url) throw new BadRequestException('url query param is required');

    try {
      const decoded = decodeURIComponent(url);
      const cdnResponse = await fetch(decoded, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
          Referer: 'https://www.instagram.com/',
        },
      });

      if (!cdnResponse.ok) {
        throw new BadRequestException(`El CDN respondió con status ${cdnResponse.status}`);
      }

      const contentType = cdnResponse.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await cdnResponse.arrayBuffer());

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (err: any) {
      this.logger.error(`Proxy error for ${url}: ${err.message}`);
      throw new BadRequestException(`No se pudo obtener la imagen: ${err.message}`);
    }
  }
}
