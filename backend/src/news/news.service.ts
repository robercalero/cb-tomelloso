import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepo: Repository<News>,
  ) {}

  async findAll(category?: string, page = 1, limit = 10, source?: string): Promise<{ data: News[]; total: number; page: number; limit: number }> {
    const where: any = { isPublished: true };
    if (category && category !== 'all') where.category = category;
    if (source) where.source = source;
    const [data, total] = await this.newsRepo.findAndCount({
      where,
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { author: true },
    });
    return { data, total, page, limit };
  }

  async findForHeroSlider(limit = 6): Promise<News[]> {
    return this.newsRepo.find({
      where: { isPublished: true, imageUrl: Not(IsNull()) },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async findBySlug(slug: string): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { slug }, relations: { author: true } });
    if (!news) throw new NotFoundException(`Noticia con slug "${slug}" no encontrada`);
    await this.newsRepo.increment({ id: news.id }, 'views', 1);
    return news;
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepo.findOne({ where: { id }, relations: { author: true } });
    if (!news) throw new NotFoundException(`Noticia con id ${id} no encontrada`);
    return news;
  }

  async create(dto: CreateNewsDto): Promise<News> {
    const news = this.newsRepo.create({
      ...dto,
      publishedAt: dto.isPublished ? new Date() : null,
    });
    return this.newsRepo.save(news);
  }

  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    await this.newsRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.newsRepo.delete(id);
  }
}
