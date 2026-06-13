import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id', type: 'int', nullable: true })
  productId: number | null;

  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  productName: string;

  @Column({ name: 'product_sku', type: 'varchar', length: 100, nullable: true })
  productSku: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  size: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ type: 'smallint' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 8, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  subtotal: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;
}
