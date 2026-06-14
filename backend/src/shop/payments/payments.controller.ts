import { Controller, Post, Get, Body, Req, Headers, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('shop / payments')
@Controller('shop/payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {}

  @Post('checkout')
  async createCheckout(@Body() dto: CheckoutDto) {
    try {
      const cart = await this.cartService.getCart(dto.sessionId);
      if (cart.length === 0) {
        return { error: 'El carrito está vacío' };
      }

      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined,
      }));

      const order = await this.ordersService.create({
        ...dto,
        items: orderItems,
        sessionId: dto.sessionId,
      } as any);

      const stripeItems = cart.map(item => ({
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
        image: (item.product.images as string[])?.[0] || undefined,
      }));

      const baseUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200');

      const result = await this.paymentsService.createCheckoutSession({
        items: stripeItems,
        sessionId: dto.sessionId,
        orderId: order.id,
        successUrl: `${baseUrl}/tienda/pedido/${order.orderNumber}`,
        cancelUrl: `${baseUrl}/tienda/checkout`,
      });

      return result;
    } catch (e: any) {
      this.logger.error(`Checkout error: ${e.message}`, e.stack);
      return { error: `Error al procesar el pago: ${e.message}` };
    }
  }

  @Post('webhook')
  @SkipThrottle()
  async handleWebhook(
    @Req() req: { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      return { received: true };
    }

    const event = this.paymentsService.constructEvent(payload, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Record<string, unknown>;
      const metadata = (session.metadata as Record<string, string> | undefined) || {};
      const orderId = metadata.orderId;
      if (orderId) {
        const existing = await this.ordersService.findByStripeSessionId(session.id as string);
        if (existing && existing.status !== 'pending') {
          return { received: true, duplicate: true };
        }
        await this.ordersService.confirmPayment(Number(orderId));
        await this.ordersService.updateStripeInfo(Number(orderId), {
          stripeSessionId: session.id as string,
          stripePaymentIntent: session.payment_intent as string,
          status: 'paid',
        });
      }
    }

    return { received: true };
  }

  @Get('status')
  status() {
    return {
      configured: !!process.env.STRIPE_SECRET_KEY
        && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder',
    };
  }
}
