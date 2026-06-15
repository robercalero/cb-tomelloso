import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
  ) {}

  async findAll(teamId?: number, status?: string, page = 1, limit = 20): Promise<{ data: Match[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (status && status !== 'all') where.status = status;
    const [data, total] = await this.matchRepo.findAndCount({
      where,
      relations: { team: true },
      order: { matchDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findUpcoming(limit = 4): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.matchRepo.find({
      where: { status: 'scheduled', matchDate: MoreThanOrEqual(today) },
      relations: { team: true },
      order: { matchDate: 'ASC', matchTime: 'ASC' },
      take: limit,
    });
  }

  async findResults(limit = 5): Promise<Match[]> {
    return this.matchRepo.find({
      where: { status: 'finished' },
      relations: { team: true },
      order: { matchDate: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: { team: true },
    });
    if (!match) throw new NotFoundException(`Partido con id ${id} no encontrado`);
    return match;
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const match = this.matchRepo.create(dto);
    return this.matchRepo.save(match);
  }

  async update(id: number, dto: UpdateMatchDto): Promise<Match> {
    await this.findOne(id);
    await this.matchRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.matchRepo.delete(id);
  }
}
