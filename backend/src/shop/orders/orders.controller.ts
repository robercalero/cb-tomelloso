import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('shop / orders')
@Controller('shop/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number): Promise<{ orders: Order[]; total: number }> {
    return this.service.findAll(page || 1, limit || 20);
  }

  @Get('by-stripe-session/:stripeSessionId')
  findByStripeSession(@Param('stripeSessionId') stripeSessionId: string): Promise<Order | null> {
    return this.service.findByStripeSessionId(stripeSessionId);
  }

  @Get(':orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<Order> {
    return this.service.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('trackingNumber') trackingNumber?: string,
  ): Promise<Order> {
    return this.service.updateStatus(id, status as any, trackingNumber);
  }
}
