import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { News } from '../news/entities/news.entity';
import { Order } from '../shop/orders/entities/order.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Member } from '../members/entities/member.entity';
import { Product } from '../shop/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, Order, ContactMessage, Member, Product]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}
