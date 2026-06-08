import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberRepo.find({
      where: { isActive: true },
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
    const member = this.memberRepo.create(dto);
    return this.memberRepo.save(member);
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
}
