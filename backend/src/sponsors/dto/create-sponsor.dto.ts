import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsEmail, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SponsorTier } from '../entities/sponsor.entity';

export class CreateSponsorDto {
  @ApiProperty({ example: 'Val Brokers' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: '/assets/sponsors/valbrokers.png' })
  @IsString()
  logoUrl: string;

  @ApiPropertyOptional({ example: 'https://www.jimenezvalentin.es' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ enum: ['principal', 'oro', 'plata', 'bronce'] })
  @IsOptional()
  @IsEnum(['principal', 'oro', 'plata', 'bronce'])
  tier?: SponsorTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
