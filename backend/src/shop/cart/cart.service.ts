import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getCart(sessionId: string): Promise<CartItem[]> {
    return this.cartRepo.find({
      where: { sessionId },
      relations: { product: { category: true } },
      order: { addedAt: 'ASC' },
    });
  }

  async addItem(sessionId: string, dto: AddToCartDto): Promise<CartItem> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Solo quedan ${product.stock} unidades disponibles`);
    }

    const where: Record<string, unknown> = {
      sessionId,
      productId: dto.productId,
    };
    if (dto.size != null) {
      where.size = dto.size;
    } else {
      where.size = IsNull();
    }
    if (dto.color != null) {
      where.color = dto.color;
    } else {
      where.color = IsNull();
    }
    const existing = await this.cartRepo.findOne({ where });

    if (existing) {
      existing.quantity += dto.quantity;
      const saved = await this.cartRepo.save(existing);
      return this.cartRepo.findOneOrFail({
        where: { id: saved.id },
        relations: { product: { category: true } },
      });
    }

    const item = this.cartRepo.create({
      sessionId,
      productId: dto.productId,
      quantity: dto.quantity,
      size: dto.size || null,
      color: dto.color || null,
    });
    const saved = await this.cartRepo.save(item);
    return this.cartRepo.findOneOrFail({
      where: { id: saved.id },
      relations: { product: { category: true } },
    });
  }

  async updateItem(sessionId: string, itemId: number, quantity: number): Promise<CartItem | null> {
    const item = await this.cartRepo.findOne({ where: { id: itemId, sessionId } });
    if (!item) throw new NotFoundException('Ítem del carrito no encontrado');
    if (quantity <= 0) {
      await this.cartRepo.remove(item);
      return null;
    }
    item.quantity = quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(sessionId: string, itemId: number): Promise<void> {
    const item = await this.cartRepo.findOne({ where: { id: itemId, sessionId } });
    if (item) await this.cartRepo.remove(item);
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.cartRepo.delete({ sessionId });
  }

  async getCartTotal(sessionId: string): Promise<number> {
    const items = await this.getCart(sessionId);
    return items.reduce((sum, i) => sum + (Number(i.product.price) * i.quantity), 0);
  }
}
