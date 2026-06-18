import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsDateString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MatchStatus } from '../entities/match.entity';

export class CreateMatchDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  teamId: number;

  @ApiProperty({ example: 'Val Brokers CB Tomelloso' })
  @IsString()
  @Length(1, 100)
  homeTeam: string;

  @ApiProperty({ example: 'CB Puertollano' })
  @IsString()
  @Length(1, 100)
  awayTeam: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeTeamLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awayTeamLogo?: string;

  @ApiProperty({ example: '2025-09-20' })
  @IsDateString()
  matchDate: string;

  @ApiProperty({ example: '19:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'matchTime debe tener formato HH:MM' })
  matchTime: string;

  @ApiProperty({ example: '1ª Autonómica CLM' })
  @IsString()
  @Length(1, 100)
  competition: string;

  @ApiProperty({ example: 'Pabellón San José, Tomelloso' })
  @IsString()
  @Length(1, 200)
  venue: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHome?: boolean;

  @ApiPropertyOptional({ example: 68 })
  @IsOptional()
  @IsNumber()
  scoreHome?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsNumber()
  scoreAway?: number;

  @ApiPropertyOptional({ enum: ['scheduled', 'live', 'finished', 'postponed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['scheduled', 'live', 'finished', 'postponed', 'cancelled'])
  status?: MatchStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
