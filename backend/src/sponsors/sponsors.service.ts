import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepo: Repository<Sponsor>,
  ) {}

  async findAll(): Promise<Sponsor[]> {
    return this.sponsorRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Sponsor> {
    const sponsor = await this.sponsorRepo.findOne({ where: { id } });
    if (!sponsor) throw new NotFoundException(`Patrocinador con id ${id} no encontrado`);
    return sponsor;
  }

  async create(dto: CreateSponsorDto): Promise<Sponsor> {
    const sponsor = this.sponsorRepo.create(dto);
    return this.sponsorRepo.save(sponsor);
  }

  async update(id: number, dto: UpdateSponsorDto): Promise<Sponsor> {
    await this.findOne(id);
    await this.sponsorRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.sponsorRepo.update(id, { isActive: false });
  }
}
