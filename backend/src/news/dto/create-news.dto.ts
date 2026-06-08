import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NewsCategory } from '../entities/news.entity';

export class CreateNewsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @ApiProperty({ example: 'Gran victoria del senior en Puertollano' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({ example: 'gran-victoria-senior-puertollano' })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiProperty({ example: 'El Val Brokers CB Tomelloso consigue una importante victoria...' })
  @IsString()
  @Length(1, 500)
  excerpt: string;

  @ApiProperty({ example: 'Contenido completo de la noticia...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ['resultado', 'club', 'cantera', 'evento', 'general'] })
  @IsOptional()
  @IsEnum(['resultado', 'club', 'cantera', 'evento', 'general'])
  category?: NewsCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ enum: ['instagram', 'twitter', 'facebook', 'youtube', 'web'] })
  @IsOptional()
  @IsEnum(['instagram', 'twitter', 'facebook', 'youtube', 'web'])
  source?: 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'web';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceUrl?: string;
}
