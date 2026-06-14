import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Product } from '../products/entities/product.entity';
import { ShopSeedService } from './shop-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory, Product])],
  providers: [ShopSeedService],
  exports: [ShopSeedService],
})
export class ShopSeedModule {}
