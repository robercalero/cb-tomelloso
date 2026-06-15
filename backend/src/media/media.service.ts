import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  async onModuleInit() {
    try {
      await this.mediaRepo.query('SELECT 1 FROM `media` LIMIT 1');
    } catch {
      this.logger.log('Tabla `media` no existe — creándola...');
      await this.mediaRepo.query(`
        CREATE TABLE IF NOT EXISTS \`media\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`filename\` VARCHAR(255) NOT NULL,
          \`data\` MEDIUMBLOB NOT NULL,
          \`mimeType\` VARCHAR(50) NOT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      this.logger.log('Tabla `media` creada correctamente');
    }
  }

  async saveImage(filename: string, data: Buffer, mimeType: string): Promise<Media> {
    const media = this.mediaRepo.create({ filename, data, mimeType });
    return this.mediaRepo.save(media);
  }

  async findById(id: number): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }
}
