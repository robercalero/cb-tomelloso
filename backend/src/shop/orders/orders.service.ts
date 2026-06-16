import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const productIds = dto.items.map(i => i.productId);
      const products: Product[] = [];
      for (const id of productIds) {
        const p = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_read')
          .where('product.id = :id', { id })
          .getOne();
        if (!p) throw new NotFoundException(`Producto #${id} no encontrado`);
        products.push(p);
      }
      const productMap = new Map<number, Product>(products.map(p => [p.id, p]));

      const orderItems: Partial<OrderItem>[] = [];
      let totalAmount = 0;

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        if (!product.isActive) throw new BadRequestException(`"${product.name}" no está disponible`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          size: item.size || null,
          color: item.color || null,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          imageUrl: (product.images as string[])?.[0] || null,
        });
      }

      const orderNumber = await this.generateOrderNumber(queryRunner);

      const order = queryRunner.manager.create(Order, {
        orderNumber,
        sessionId: dto.sessionId || null,
        totalAmount,
        shippingName: dto.shippingName,
        shippingEmail: dto.shippingEmail,
        shippingPhone: dto.shippingPhone || null,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity,
        shippingPostalCode: dto.shippingPostalCode,
        shippingCountry: dto.shippingCountry || 'España',
        notes: dto.notes || null,
        status: 'pending',
      });

      const saved = await queryRunner.manager.save(order);

      for (const item of orderItems) {
        await queryRunner.manager.save(OrderItem, { ...item, orderId: saved.id });
      }
      saved.items = orderItems as OrderItem[];

      await queryRunner.commitTransaction();
      return saved;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmPayment(orderId: number, stripeSessionId?: string, stripePaymentIntent?: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException(`Pedido #${orderId} no encontrado`);
    if (order.status !== 'pending') return;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const item of order.items) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: item.productId })
          .getOne();

        if (!product) continue;
        if (product.stock < item.quantity) {
          order.status = 'cancelled';
          await queryRunner.manager.save(order);
          await queryRunner.commitTransaction();
          throw new BadRequestException(
            `Stock insuficiente para "${item.productName}"`
          );
        }
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);
      }

      order.status = 'paid';
      order.paidAt = new Date();
      if (stripeSessionId) order.stripeSessionId = stripeSessionId;
      if (stripePaymentIntent) order.stripePaymentIntent = stripePaymentIntent;
      await queryRunner.manager.save(order);

      if (order.sessionId) {
        await queryRunner.manager.delete(CartItem, { sessionId: order.sessionId });
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Pedido #${order.id} (${order.orderNumber}) confirmado — stock deducido, estado: paid`);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error confirmando pago del pedido #${order.orderNumber}: ${(e as Error).message}`);
      throw e;
    } finally {
      await queryRunner.release();
    }

    const emailData = this.toEmailData(order);
    await this.mailService.sendOrderConfirmation(emailData).catch(() => {});
    const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'admin@cbtomelloso.es');
    await this.mailService.notifyAdminNewOrder(emailData, adminEmail).catch(() => {});
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { orderNumber }, relations: { items: true } });
    if (!order) throw new NotFoundException(`Pedido ${orderNumber} no encontrado`);
    return order;
  }

  async findBySessionId(sessionId: string): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { sessionId }, relations: { items: true } });
  }

  async findByStripeSessionId(stripeSessionId: string): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { stripeSessionId }, relations: { items: true } });
  }

  async findAll(cursor?: string, limit = 20): Promise<{ orders: Order[]; nextCursor: string | null }> {
    const where: any = {};
    if (cursor) {
      where.createdAt = LessThan(new Date(cursor));
    }
    const orders = await this.orderRepo.find({
      where,
      relations: { items: true },
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });
    const hasMore = orders.length > limit;
    if (hasMore) orders.pop();
    const nextCursor = hasMore ? orders[orders.length - 1].createdAt.toISOString() : null;
    return { orders, nextCursor };
  }

  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['pending', 'processing', 'refunded'],
    processing: ['paid', 'shipped'],
    shipped: ['processing', 'delivered'],
    delivered: ['shipped'],
    cancelled: ['pending'],
    refunded: ['paid'],
  };

  async updateStatus(id: number, status: OrderStatus, trackingNumber?: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: { items: true } });
    if (!order) throw new NotFoundException(`Pedido #${id} no encontrado`);
    const prevStatus = order.status;
    if (status === prevStatus) return order;
    const allowed = this.validTransitions[prevStatus];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `No se puede cambiar de "${prevStatus}" a "${status}". Transiciones válidas: ${allowed.join(', ') || 'ninguna'}`
      );
    }
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'paid') order.paidAt = new Date();
    if (status === 'shipped') order.shippedAt = new Date();
    const saved = await this.orderRepo.save(order);

    if (status === 'paid' && prevStatus !== 'paid') {
      const emailData = this.toEmailData(saved);
      this.mailService.sendOrderConfirmation(emailData).catch(() => {});
      const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'admin@cbtomelloso.es');
      this.mailService.notifyAdminNewOrder(emailData, adminEmail).catch(() => {});
    }
    if (status === 'shipped' && prevStatus !== 'shipped') {
      const emailData = this.toEmailData(saved);
      this.mailService.sendOrderShipped(emailData).catch(() => {});
    }

    return saved;
  }

  async updateStripeInfo(id: number, data: { stripeSessionId?: string; stripePaymentIntent?: string; status?: OrderStatus }): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: { items: true } });
    if (!order) throw new NotFoundException(`Pedido #${id} no encontrado`);
    if (data.stripeSessionId) order.stripeSessionId = data.stripeSessionId;
    if (data.stripePaymentIntent) order.stripePaymentIntent = data.stripePaymentIntent;
    if (data.status) {
      order.status = data.status;
      if (data.status === 'paid') order.paidAt = new Date();
    }
    const saved = await this.orderRepo.save(order);

    if (data.status === 'paid') {
      const emailData = this.toEmailData(saved);
      this.mailService.sendOrderConfirmation(emailData).catch(() => {});
      const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'admin@cbtomelloso.es');
      this.mailService.notifyAdminNewOrder(emailData, adminEmail).catch(() => {});
    }

    return saved;
  }

  private toEmailData(order: Order) {
    return {
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      shippingEmail: order.shippingEmail,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      totalAmount: order.totalAmount.toString(),
      items: (order.items || []).map(i => ({
        productName: i.productName,
        size: i.size,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
    };
  }

  private async generateOrderNumber(existingRunner?: import('typeorm').QueryRunner): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const startOfNextYear = new Date(year + 1, 0, 1);

    const runQuery = async (runner: import('typeorm').QueryRunner) => {
      return runner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')
        .where('order.createdAt >= :start', { start: startOfYear })
        .andWhere('order.createdAt < :end', { end: startOfNextYear })
        .getCount();
    };

    if (existingRunner) {
      const count = await runQuery(existingRunner);
      return `CBT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const count = await runQuery(queryRunner);
      await queryRunner.commitTransaction();
      return `CBT-${year}-${String(count + 1).padStart(4, '0')}`;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
