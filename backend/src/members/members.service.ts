import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async findAll(includeInactive = false): Promise<Member[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.memberRepo.find({
      where,
      relations: { user: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepo.findOne({ where: { id }, relations: { user: true } });
    if (!member) throw new NotFoundException(`Socio con id ${id} no encontrado`);
    return member;
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const memberNumber = await this.generateMemberNumber(manager);
      const member = manager.create(Member, {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        memberType: dto.memberType,
        memberNumber,
        joinedAt: new Date().toISOString().split('T')[0],
        userId: dto.userId ?? null,
      });
      return manager.save(Member, member);
    });

    this.mailService.sendMemberWelcome({
      name: dto.name,
      email: dto.email,
      memberType: dto.memberType || 'adulto',
      memberNumber: saved.memberNumber ?? undefined,
    }).catch(() => {});

    return saved;
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    await this.findOne(id);
    await this.memberRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.memberRepo.update(id, { isActive: false });
  }

  private async generateMemberNumber(manager?: any): Promise<string> {
    const year = new Date().getFullYear();
    const repo = manager ? manager.getRepository(Member) : this.memberRepo;
    const last = await repo.findOne({ order: { id: 'DESC' } });
    const next = (last?.id || 0) + 1;
    return `CBT-${year}-${String(next).padStart(4, '0')}`;
  }
}
