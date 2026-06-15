import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepo: Repository<ContactMessage>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async findAll(isRead?: boolean, page = 1, limit = 20): Promise<{ data: ContactMessage[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (isRead !== undefined) where.isRead = isRead;
    const [data, total] = await this.contactRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<ContactMessage> {
    const message = await this.contactRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
    return message;
  }

  async create(dto: CreateContactMessageDto, ipAddress?: string): Promise<ContactMessage> {
    const message = this.contactRepo.create({
      ...dto,
      ipAddress: ipAddress || null,
    });
    const saved = await this.contactRepo.save(message);

    const subject = dto.subject || 'general';
    await this.mailService.sendContactConfirmation(dto.name, dto.email, subject);
    const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'admin@cbtomelloso.es');
    await this.mailService.notifyAdminNewContact(
      { name: dto.name, email: dto.email, subject, message: dto.message },
      adminEmail,
    );

    return saved;
  }

  async markAsRead(id: number): Promise<void> {
    await this.contactRepo.update(id, { isRead: true });
  }
}
