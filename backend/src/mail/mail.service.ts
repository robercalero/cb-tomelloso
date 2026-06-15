import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

export interface OrderEmailData {
  orderNumber: string;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  totalAmount: string;
  items: {
    productName: string;
    size?: string | null;
    quantity: number;
    subtotal: number;
  }[];
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface MemberEmailData {
  name: string;
  email: string;
  memberType: string;
  memberNumber?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly webUrl: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    this.webUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200');
  }

  private async sendWithRetry(mailOptions: any, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.mailer.sendMail(mailOptions);
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        const delay = 1000 * Math.pow(2, attempt - 1);
        this.logger.warn(`Intento ${attempt}/${retries} falló, reintentando en ${delay}ms: ${(err as Error).message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async sendOrderConfirmation(order: OrderEmailData): Promise<void> {
    try {
      await this.sendWithRetry({
        to: order.shippingEmail,
        subject: `Pedido confirmado — ${order.orderNumber} | CB Tomelloso`,
        template: 'order-confirmation',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.shippingName,
          items: order.items,
          totalAmount: order.totalAmount,
          shippingAddress: `${order.shippingAddress}, ${order.shippingCity}`,
          trackUrl: `${this.webUrl}/tienda/pedido/${order.orderNumber}`,
          clubEmail: 'info@cbtomelloso.es',
        },
      });
    } catch (err) {
      this.logger.warn(`Email confirmación pedido falló tras reintentos: ${(err as Error).message}`);
    }
  }

  async sendOrderShipped(order: OrderEmailData, trackingNumber?: string): Promise<void> {
    try {
      await this.sendWithRetry({
        to: order.shippingEmail,
        subject: `Tu pedido está en camino — ${order.orderNumber}`,
        template: 'order-shipped',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.shippingName,
          trackingNumber: trackingNumber || 'Sin número de seguimiento',
          trackUrl: `${this.webUrl}/tienda/pedido/${order.orderNumber}`,
        },
      });
    } catch (err) {
      this.logger.warn(`Email envío falló tras reintentos: ${(err as Error).message}`);
    }
  }

  async notifyAdminNewOrder(order: OrderEmailData, adminEmail: string): Promise<void> {
    try {
      await this.sendWithRetry({
        to: adminEmail,
        subject: `Nuevo pedido: ${order.orderNumber} (${order.shippingName})`,
        template: 'admin-new-order',
        context: {
          orderNumber: order.orderNumber,
          customerName: order.shippingName,
          customerEmail: order.shippingEmail,
          totalAmount: order.totalAmount,
          items: order.items,
          adminUrl: `${this.webUrl}/admin/pedidos`,
        },
      });
    } catch (err) {
      this.logger.warn(`Email notificación admin pedido falló tras reintentos: ${(err as Error).message}`);
    }
  }

  async sendContactConfirmation(name: string, email: string, subject: string): Promise<void> {
    try {
      await this.sendWithRetry({
        to: email,
        subject: `Hemos recibido tu mensaje — CB Tomelloso`,
        template: 'contact-confirmation',
        context: {
          name,
          subject,
          clubEmail: 'info@cbtomelloso.es',
        },
      });
    } catch (err) {
      this.logger.warn(`Email confirmación contacto falló tras reintentos: ${(err as Error).message}`);
    }
  }

  async notifyAdminNewContact(data: ContactEmailData, adminEmail: string): Promise<void> {
    try {
      await this.sendWithRetry({
        to: adminEmail,
        subject: `Nuevo mensaje de contacto de ${data.name}`,
        template: 'admin-new-contact',
        context: {
          ...data,
          adminUrl: `${this.webUrl}/admin/mensajes`,
        },
      });
    } catch (err) {
      this.logger.warn(`Email notificación admin contacto falló tras reintentos: ${(err as Error).message}`);
    }
  }

  async sendMemberWelcome(member: MemberEmailData): Promise<void> {
    try {
      const typeLabel: Record<string, string> = { adulto: 'Adulto', juvenil: 'Juvenil', familia: 'Familia' };
      await this.sendWithRetry({
        to: member.email,
        subject: `Bienvenido/a al CB Tomelloso, ${member.name}`,
        template: 'member-welcome',
        context: {
          ...member,
          memberTypeLabel: typeLabel[member.memberType] ?? member.memberType,
          clubUrl: this.webUrl,
        },
      });
    } catch (err) {
      this.logger.warn(`Email bienvenida socio falló tras reintentos: ${(err as Error).message}`);
    }
  }
}
