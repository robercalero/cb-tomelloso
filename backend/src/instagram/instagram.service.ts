import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../news/entities/news.entity';
import { MediaService } from '../media/media.service';

const PROXY_PATH_ID = '/api/v1/media/proxy?id=';
const PROXY_PATH_URL = '/api/v1/media/proxy?url=';
const INSTAGRAM_URL = 'https://www.instagram.com';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
  }

  async importFromUrl(url: string): Promise<News> {
    const cleanUrl = url.split('?')[0];
    const existing = await this.newsRepo.findOne({ where: { sourceUrl: cleanUrl } });
    if (existing) {
      throw new ConflictException(`Esta publicación ya fue importada como "${existing.title}"`);
    }

    let result: any;
    try {
      const { instagramGetUrl } = require('instagram-url-direct');
      result = await instagramGetUrl(cleanUrl, { retries: 3, delay: 2000 });
    } catch (err: any) {
      throw new BadRequestException(`No se pudo obtener la publicación: ${err.message}`);
    }

    if (!result || !result.url_list || result.url_list.length === 0) {
      throw new BadRequestException('No se encontraron imágenes en la publicación');
    }

    const caption = result.post_info?.caption || '';
    const lines = caption.split('\n').filter(Boolean);
    const title = this.extractTitle(caption, lines) || 'Publicación de Instagram';
    const excerpt = caption.slice(0, 500);
    const content = caption
      ? `<p>${caption.replace(/\n/g, '</p><p>')}</p>`
      : '<p>Publicación de Instagram</p>';

    const mediaDetails = result.media_details || [];

    const downloadOne = async (rawUrl: string): Promise<string> => {
      try {
        const resp = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
            Referer: 'https://www.instagram.com/',
          },
        });
        if (!resp.ok) return `${this.baseUrl}${PROXY_PATH_URL}${encodeURIComponent(rawUrl)}`;
        const buffer = Buffer.from(await resp.arrayBuffer());
        const contentType = resp.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/').pop() || 'jpg';
        const media = await this.mediaService.saveImage(`instagram.${ext}`, buffer, contentType);
        return `${this.baseUrl}${PROXY_PATH_ID}${media.id}`;
      } catch {
        return `${this.baseUrl}${PROXY_PATH_URL}${encodeURIComponent(rawUrl)}`;
      }
    };

    const media = mediaDetails.length > 0
      ? await Promise.all(mediaDetails.map(async (m: any) => {
          const url = await downloadOne(m.url);
          const thumbnail = m.thumbnail ? await downloadOne(m.thumbnail) : undefined;
          return { url, type: m.type || 'image', ...(thumbnail ? { thumbnail } : {}) };
        }))
      : await Promise.all(result.url_list.map(async (u: string) => ({
          url: await downloadOne(u),
          type: 'image',
        })));

    const first = media[0];
    const imageUrl = first.type === 'video' && first.thumbnail
      ? first.thumbnail
      : first.url;

    const slugBase = slugify(title);
    const uniqueId = cleanUrl.split('/').filter(Boolean).pop() || Date.now().toString();
    const slug = `instagram-${slugBase.slice(0, 170)}-${uniqueId}`;

    const news = this.newsRepo.create({
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      media,
      category: 'general',
      source: 'instagram' as any,
      sourceUrl: cleanUrl,
      isPublished: true,
      publishedAt: new Date(),
    });

    return this.newsRepo.save(news);
  }

  private extractTitle(caption: string, lines: string[]): string {
    const clean = lines.find(l => {
      const trimmed = l.trim();
      return trimmed.length > 10 && !trimmed.startsWith('#') && !trimmed.startsWith('http');
    });
    if (clean) return clean.slice(0, 100);
    const noHashtags = caption.replace(/#\w+/g, '').trim();
    return noHashtags.slice(0, 100) || 'Publicación de Instagram';
  }

  getStatus() {
    return {
      method: 'scrape',
      configured: true,
      description: 'Importación por URL directa sin autenticación',
    };
  }
}
