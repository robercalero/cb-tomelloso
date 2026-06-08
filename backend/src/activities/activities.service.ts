import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { isPublished: true },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    return activity;
  }

  async create(dto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepo.create(dto);
    return this.activityRepo.save(activity);
  }

  async update(id: number, dto: UpdateActivityDto): Promise<Activity> {
    await this.findOne(id);
    await this.activityRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.activityRepo.update(id, { isPublished: false });
  }
}
