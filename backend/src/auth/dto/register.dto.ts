import { IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
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
}
