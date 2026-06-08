import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) {}

  async findAll(teamId?: number): Promise<Player[]> {
    const where = teamId ? { teamId, isActive: true } : { isActive: true };
    return this.playerRepo.find({
      where,
      relations: { team: true },
      order: { dorsal: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Player> {
    const player = await this.playerRepo.findOne({
      where: { id },
      relations: { team: true },
    });
    if (!player) throw new NotFoundException(`Jugador con id ${id} no encontrado`);
    return player;
  }

  async create(dto: CreatePlayerDto): Promise<Player> {
    const player = this.playerRepo.create(dto);
    return this.playerRepo.save(player);
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<Player> {
    await this.findOne(id);
    await this.playerRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.playerRepo.update(id, { isActive: false });
  }
}
