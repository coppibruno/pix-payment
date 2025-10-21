import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status dos serviços' })
  @ApiResponse({
    status: 200,
    description: 'Status dos serviços',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            redis: { type: 'string', example: 'connected' },
            mongodb: { type: 'string', example: 'connected' },
            rabbitmq: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  async check() {
    return this.healthService.check();
  }
}
