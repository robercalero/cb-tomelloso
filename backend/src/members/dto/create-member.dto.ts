import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MemberType } from '../entities/member.entity';

export class CreateMemberDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  userId?: number;

  @ApiProperty({ example: 'María García' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+34 600 000 000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['adulto', 'juvenil', 'familia', 'honorario'] })
  @IsOptional()
  @IsEnum(['adulto', 'juvenil', 'familia', 'honorario'])
  memberType?: MemberType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memberNumber?: string;

  @ApiPropertyOptional({ example: '2025-09-01' })
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
