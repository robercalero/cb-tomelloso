import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepo: Repository<Gallery>,
  ) {}

  async findAll(teamId?: number, season?: string): Promise<Gallery[]> {
    const where: any = { isPublished: true };
    if (teamId) where.teamId = teamId;
    if (season) where.season = season;
    return this.galleryRepo.find({
      where,
      relations: { team: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gallery> {
    const item = await this.galleryRepo.findOne({ where: { id }, relations: { team: true } });
    if (!item) throw new NotFoundException(`Elemento de galería con id ${id} no encontrado`);
    return item;
  }

  async create(dto: CreateGalleryDto): Promise<Gallery> {
    const item = this.galleryRepo.create(dto);
    return this.galleryRepo.save(item);
  }

  async update(id: number, dto: UpdateGalleryDto): Promise<Gallery> {
    await this.findOne(id);
    await this.galleryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.galleryRepo.delete(id);
  }
}
