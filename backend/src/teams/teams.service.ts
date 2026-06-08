import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find({
      where: { isActive: true },
      relations: { players: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: { players: true },
    });
    if (!team) throw new NotFoundException(`Equipo con id ${id} no encontrado`);
    return team;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepo.create(dto);
    return this.teamRepo.save(team);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team> {
    await this.findOne(id);
    await this.teamRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.teamRepo.update(id, { isActive: false });
  }
}
