import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('shop / cart')
@Controller('shop/cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get(':sessionId')
  getCart(@Param('sessionId') sessionId: string): Promise<CartItem[]> {
    return this.service.getCart(sessionId);
  }

  @Post(':sessionId')
  addItem(
    @Param('sessionId') sessionId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartItem> {
    return this.service.addItem(sessionId, dto);
  }

  @Patch(':sessionId/:itemId')
  updateItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartItem | null> {
    return this.service.updateItem(sessionId, itemId, dto.quantity);
  }

  @Delete(':sessionId/:itemId')
  removeItem(
    @Param('sessionId') sessionId: string,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<void> {
    return this.service.removeItem(sessionId, itemId);
  }

  @Delete(':sessionId')
  clearCart(@Param('sessionId') sessionId: string): Promise<void> {
    return this.service.clearCart(sessionId);
  }
}
