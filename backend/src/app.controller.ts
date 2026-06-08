import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  root() {
    return { message: 'CB Tomelloso API', version: '1.0', docs: '/api/docs' };
  }
}
