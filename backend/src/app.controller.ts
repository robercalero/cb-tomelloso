import { Controller, Get, Logger } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  root() {
    return { message: 'CB Tomelloso API', version: '1.0', docs: '/api/docs' };
  }

  @Get('health')
  @ApiExcludeEndpoint()
  async healthCheck() {
    let dbStatus = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      dbStatus = 'error';
      this.logger.error('Health check: DB connection failed');
    }
    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'CB Tomelloso API',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
