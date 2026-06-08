import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

export class ImportUrlDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

@ApiTags('instagram')
@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post('import-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Importar una publicación de Instagram por URL' })
  @HttpCode(HttpStatus.CREATED)
  async importFromUrl(@Body() dto: ImportUrlDto) {
    return this.instagramService.importFromUrl(dto.url);
  }

  @Get('status')
  @ApiOperation({ summary: 'Estado del módulo Instagram' })
  getStatus() {
    return this.instagramService.getStatus();
  }
}
