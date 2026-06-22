import { IsString, IsEmail, IsEnum, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ContactSubject } from '../entities/contact-message.entity';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['general', 'socio', 'patrocinio', 'prensa', 'otro'] })
  @IsOptional()
  @IsEnum(['general', 'socio', 'patrocinio', 'prensa', 'otro'])
  subject?: ContactSubject;

  @ApiProperty({ example: 'Me gustaría obtener información sobre...' })
  @IsString()
  @Length(1, 5000)
  message: string;
}
