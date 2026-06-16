import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener noticias publicadas (paginadas)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isPublished', required: false, type: String, description: 'Filtrar por estado: true | false | all (todas)' })
  findAll(
    @Query('category') category?: string,
    @Query('source') source?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.newsService.findAll(category, page ? +page : 1, limit ? +limit : 10, source, isPublished);
  }

  @Get('hero')
  @ApiOperation({ summary: 'Obtener noticias para hero slider' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findHeroSlides(@Query('limit') limit?: string) {
    return this.newsService.findForHeroSlider(limit ? +limit : 6);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener noticia por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Post(':slug/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar una visita a la noticia' })
  async registerView(@Param('slug') slug: string): Promise<void> {
    await this.newsService.registerView(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin/Editor] Crear noticia' })
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin/Editor] Actualizar noticia' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Eliminar noticia' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}
