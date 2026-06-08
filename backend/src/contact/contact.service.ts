import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepo: Repository<ContactMessage>,
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
    return this.contactRepo.save(message);
  }

  async markAsRead(id: number): Promise<void> {
    await this.contactRepo.update(id, { isRead: true });
  }
}
