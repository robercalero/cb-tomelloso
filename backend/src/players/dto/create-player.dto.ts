import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PlayerPosition } from '../entities/player.entity';

export class CreatePlayerDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  teamId: number;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'García López' })
  @IsString()
  @Length(1, 100)
  surname: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(0) @Max(99)
  dorsal?: number;

  @ApiPropertyOptional({ enum: ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'] })
  @IsOptional()
  @IsEnum(['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'])
  position?: PlayerPosition;

  @ApiPropertyOptional({ example: 'España' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 2001 })
  @IsOptional()
  @IsNumber()
  birthYear?: number;

  @ApiPropertyOptional({ example: 195 })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
