import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly repo: Repository<ProductCategory>,
  ) {}

  async findAll(): Promise<ProductCategory[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ProductCategory> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría #${id} no encontrada`);
    return category;
  }

  async findBySlug(slug: string): Promise<ProductCategory> {
    const category = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!category) throw new NotFoundException(`Categoría "${slug}" no encontrada`);
    return category;
  }

  async create(data: Partial<ProductCategory>): Promise<ProductCategory> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<ProductCategory>): Promise<ProductCategory> {
    const category = await this.findOne(id);
    Object.assign(category, data);
    return this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
