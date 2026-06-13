import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  totalAmount: number;

  @Column({ name: 'shipping_name', type: 'varchar', length: 100 })
  shippingName: string;

  @Column({ name: 'shipping_email', type: 'varchar', length: 255 })
  shippingEmail: string;

  @Column({ name: 'shipping_phone', type: 'varchar', length: 20, nullable: true })
  shippingPhone: string | null;

  @Column({ name: 'shipping_address', type: 'varchar', length: 300 })
  shippingAddress: string;

  @Column({ name: 'shipping_city', type: 'varchar', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_postal_code', type: 'varchar', length: 10 })
  shippingPostalCode: string;

  @Column({ name: 'shipping_country', type: 'varchar', length: 60, default: 'España' })
  shippingCountry: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'stripe_session_id', type: 'varchar', length: 200, nullable: true })
  stripeSessionId: string | null;

  @Column({ name: 'stripe_payment_intent', type: 'varchar', length: 200, nullable: true })
  stripePaymentIntent: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'tracking_number', type: 'varchar', length: 100, nullable: true })
  trackingNumber: string | null;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
