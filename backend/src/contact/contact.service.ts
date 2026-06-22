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

  async findAll(isRead?: boolean): Promise<ContactMessage[]> {
    const where: any = {};
    if (isRead !== undefined) where.isRead = isRead;
    return this.contactRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
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
    this.mailService.sendContactConfirmation(dto.name, dto.email, subject).catch(() => {});
    const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'admin@cbtomelloso.es');
    this.mailService.notifyAdminNewContact(
      { name: dto.name, email: dto.email, subject, message: dto.message },
      adminEmail,
    ).catch(() => {});

    return saved;
  }

  async markAsRead(id: number): Promise<void> {
    await this.contactRepo.update(id, { isRead: true });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.contactRepo.delete(id);
  }
}
