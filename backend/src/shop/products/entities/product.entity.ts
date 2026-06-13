import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductCategory } from '../../product-categories/entities/product-category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => ProductCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  price: number;

  @Column({ name: 'compare_price', type: 'decimal', precision: 8, scale: 2, nullable: true, transformer: { to: (v: number | null) => v, from: (v: string | null) => v ? parseFloat(v) : null } })
  comparePrice: number | null;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: string[] | null;

  @Column({ name: 'sizes', type: 'json', nullable: true })
  sizes: string[] | null;

  @Column({ name: 'colors', type: 'json', nullable: true })
  colors: { name: string; hex: string }[] | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  season: string | null;

  @Column({ name: 'tags', type: 'json', nullable: true })
  tags: string[] | null;

  @Column({ name: 'stripe_price_id', type: 'varchar', length: 100, nullable: true })
  stripePriceId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
