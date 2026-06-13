import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../news/entities/news.entity';
import { Order } from '../shop/orders/entities/order.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Member } from '../members/entities/member.entity';
import { Product } from '../shop/products/entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@ApiBearerAuth()
export class AdminController {
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
  ) {}

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
}
