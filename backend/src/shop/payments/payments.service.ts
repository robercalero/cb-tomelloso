import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey || secretKey === 'sk_test_placeholder') {
      this.logger.warn('STRIPE_SECRET_KEY no configurada — los pagos no funcionarán');
    }
    this.stripe = new Stripe(secretKey || 'sk_test_placeholder', { apiVersion: '2025-02-24.acacia' as any });
  }

  async createCheckoutSession(dto: {
    items: { name: string; price: number; quantity: number; image?: string }[];
    sessionId: string;
    orderId: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string | null; sessionId: string; orderId: number }> {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key || key === 'sk_test_placeholder') {
      throw new BadRequestException(
        'Stripe no está configurado. Contacta con el administrador.'
      );
    }

    const lineItems = dto.items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: { cartSessionId: dto.sessionId, orderId: String(dto.orderId) },
      locale: 'es',
    });

    return { url: session.url, sessionId: session.id, orderId: dto.orderId };
  }

  constructEvent(payload: Buffer, signature: string): any {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
