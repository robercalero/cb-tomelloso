import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategory } from './entities/product-category.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('shop / categories')
@Controller('shop/categories')
export class ProductCategoriesController {
  constructor(private readonly service: ProductCategoriesService) {}

  @Get()
  findAll(): Promise<ProductCategory[]> {
    return this.service.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ProductCategory> {
    return this.service.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  create(@Body() data: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.service.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
