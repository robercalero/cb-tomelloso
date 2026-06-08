import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@cbtomelloso.es' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiContraseña123' })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({ example: 'Nombre Apellido' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ enum: ['admin', 'editor', 'socio', 'visitante'] })
  @IsOptional()
  @IsEnum(['admin', 'editor', 'socio', 'visitante'])
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
