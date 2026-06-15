import { Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { News } from '../news/entities/news.entity';
import { Order } from '../shop/orders/entities/order.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Member } from '../members/entities/member.entity';
import { Product } from '../shop/products/entities/product.entity';
import { ShopSeedService } from '../shop/seed/shop-seed.service';
import { MediaService } from '../media/media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ContactMessage)
    private readonly contactRepo: Repository<ContactMessage>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly shopSeedService: ShopSeedService,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
  }

  private readonly baseUrl: string;

  @Get('stats')
  @ApiOperation({ summary: '[Admin] Obtener estadísticas del dashboard' })
  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalNews,
      pendingOrders,
      unreadMessages,
      totalActiveMembers,
      totalProducts,
      revenueResult,
    ] = await Promise.all([
      this.newsRepo.count({ where: { isPublished: true } }),
      this.orderRepo.count({ where: { status: 'pending' } }),
      this.contactRepo.count({ where: { isRead: false } }),
      this.memberRepo.count({ where: { isActive: true } }),
      this.productRepo.count({ where: { isActive: true } }),
      this.orderRepo
        .createQueryBuilder('o')
        .select('SUM(o.totalAmount)', 'total')
        .where('o.status = :status', { status: 'paid' })
        .andWhere('o.paidAt >= :start', { start: monthStart })
        .getRawOne(),
    ]);

    return {
      totalNews,
      pendingOrders,
      unreadMessages,
      totalActiveMembers,
      totalProducts,
      revenueThisMonth: Number(revenueResult?.total ?? 0),
    };
  }

  @Post('seed')
  @ApiOperation({ summary: '[Admin] Poblar tienda con datos de ejemplo' })
  async seedShop() {
    return this.shopSeedService.seed();
  }

  @Post('migrate-instagram-images')
  @ApiOperation({ summary: '[Admin] Migrar imágenes de Instagram a almacenamiento persistente' })
  async migrateInstagramImages() {
    const newsList = await this.newsRepo.find({
      where: { source: 'instagram' as any },
      order: { publishedAt: 'DESC' },
    });

    if (newsList.length === 0) {
      return { message: 'No hay publicaciones de Instagram para migrar', migrated: 0 };
    }

    let migrated = 0;
    let errors = 0;

    for (const news of newsList) {
      if (!news.sourceUrl) {
        errors++;
        continue;
      }

      try {
        const { instagramGetUrl } = require('instagram-url-direct');
        const result = await instagramGetUrl(news.sourceUrl, { retries: 2, delay: 1000 });

        if (!result?.url_list?.length) {
          errors++;
          continue;
        }

        const downloadOne = async (rawUrl: string): Promise<string | null> => {
          try {
            const resp = await fetch(rawUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
                Referer: 'https://www.instagram.com/',
              },
            });
            if (!resp.ok) throw new Error(`CDN responded with ${resp.status}`);
            const buffer = Buffer.from(await resp.arrayBuffer());
            const contentType = resp.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.split('/').pop() || 'jpg';
            const media = await this.mediaService.saveImage(`instagram.${ext}`, buffer, contentType);
            return `${this.baseUrl}/api/v1/media/proxy?id=${media.id}`;
          } catch {
            return null;
          }
        };

        const mediaDetails = result.media_details || [];
        let media: { url: string; type: string; thumbnail?: string }[];

        if (mediaDetails.length > 0) {
          const results = await Promise.all(mediaDetails.map(async (m: any) => {
            const url = await downloadOne(m.url);
            if (!url) return null;
            const thumbnail = m.thumbnail ? await downloadOne(m.thumbnail) : undefined;
            return { url, type: m.type || 'image', ...(thumbnail ? { thumbnail } : {}) };
          }));
          media = results.filter(Boolean) as any;
        } else {
          const results = await Promise.all(result.url_list.map(async (u: string) => {
            const url = await downloadOne(u);
            return url ? { url, type: 'image' } : null;
          }));
          media = results.filter(Boolean) as any;
        }

        if (media.length === 0) {
          errors++;
          continue;
        }

        const first = media[0];
        news.imageUrl = first.thumbnail || first.url;
        news.media = media;
        await this.newsRepo.save(news);
        migrated++;
        this.logger.log(`Migrated Instagram post #${news.id}: ${news.title}`);
      } catch (err: any) {
        this.logger.error(`Failed to migrate Instagram post #${news.id}: ${err.message}`);
        errors++;
      }
    }

    return {
      message: `Migración completada: ${migrated} migradas, ${errors} errores`,
      total: newsList.length,
      migrated,
      errors,
    };
  }
}
