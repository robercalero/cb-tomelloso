import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los partidos' })
  @ApiQuery({ name: 'teamId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(@Query('teamId') teamId?: string, @Query('status') status?: string) {
    return this.matchesService.findAll(teamId ? +teamId : undefined, status);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtener próximos partidos (4)' })
  findUpcoming() {
    return this.matchesService.findUpcoming();
  }

  @Get('results')
  @ApiOperation({ summary: 'Obtener últimos resultados (5)' })
  findResults() {
    return this.matchesService.findResults();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener partido por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin/Editor] Crear partido' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin/Editor] Actualizar partido/resultado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Eliminar partido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.remove(id);
  }
}
