import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ example: 'Escuela de Verano de Baloncesto 2025' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ example: 'Organizada junto al Ayuntamiento de Tomelloso.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['torneo', 'escuela', 'evento', 'copa', 'amistoso', 'otro'] })
  @IsOptional()
  @IsEnum(['torneo', 'escuela', 'evento', 'copa', 'amistoso', 'otro'])
  activityType?: ActivityType;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Pabellón San José, Tomelloso' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
