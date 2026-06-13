import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(options?: {
    categorySlug?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; pages: number }> {
    const { categorySlug, featured, search, page = 1, limit = 12 } = options || {};

    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'cat')
      .where('p.isActive = :active', { active: true });

    if (categorySlug) {
      qb.andWhere('cat.slug = :slug', { slug: categorySlug });
    }
    if (featured !== undefined) {
      qb.andWhere('p.isFeatured = :featured', { featured });
    }
    if (search) {
      qb.andWhere(
        '(p.name LIKE :s OR p.description LIKE :s OR JSON_CONTAINS(p.tags, :sTag, "$"))',
        { s: `%${search}%`, sTag: `"${search.toLowerCase()}"` }
      );
    }

    const total = await qb.getCount();
    const products = await qb
      .orderBy('p.isFeatured', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total, pages: Math.ceil(total / limit) };
  }

  async findFeatured(limit = 4): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true, isFeatured: true },
      relations: { category: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException(`Producto "${slug}" no encontrado`);
    return product;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException(`Producto #${id} no encontrado`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto as any);
    const saved = await this.productRepo.save(product);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const saved = await this.productRepo.save(product);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepo.save(product);
  }
}
