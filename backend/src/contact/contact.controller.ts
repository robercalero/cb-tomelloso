import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Ver mensajes recibidos' })
  findAll(@Query('isRead') isRead?: string) {
    return this.contactService.findAll(
      isRead !== undefined ? isRead === 'true' : undefined
    );
  }

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Enviar mensaje de contacto' })
  create(@Body() dto: CreateContactMessageDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.contactService.create(dto, ip);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Ver detalle de mensaje' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markAsRead(id).then(() => this.contactService.findOne(id));
  }
}
