import { IsString, IsEnum, IsOptional, IsBoolean, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TeamCategory } from '../entities/team.entity';

export class CreateTeamDto {
  @ApiProperty({ example: 'Val Brokers CB Tomelloso - Sénior' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ enum: ['Senior Autonómica', 'Junior U19', 'Júnior', 'Cadete', 'Infantil', 'Alevín', 'Benjamín', 'Minibasket'] })
  @IsEnum(['Senior Autonómica', 'Junior U19', 'Júnior', 'Cadete', 'Infantil', 'Alevín', 'Benjamín', 'Minibasket'])
  category: TeamCategory;

  @ApiProperty({ example: '2025/2026' })
  @IsString()
  @Length(1, 10)
  season: string;

  @ApiPropertyOptional({ example: 'José Luis Carrasco' })
  @IsOptional()
  @IsString()
  coach?: string;

  @ApiPropertyOptional({ example: 'Raúl Moya' })
  @IsOptional()
  @IsString()
  assistantCoach?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
