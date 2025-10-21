import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../../database/schemas/notification-log.schema';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de notificações' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de registros por página',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Página atual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de notificações',
    schema: {
      type: 'object',
      properties: {
        logs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              charge_id: { type: 'string' },
              received_at: { type: 'string' },
              previous_status: { type: 'string' },
              new_status: { type: 'string' },
              message_id: { type: 'string' },
              metadata: { type: 'object' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getNotificationLogs(
    @Query('limit') limit: string = '10',
    @Query('page') page: string = '1',
  ) {
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      this.notificationLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.notificationLogModel.countDocuments(),
    ]);

    return {
      logs,
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Get('charge/:chargeId')
  @ApiOperation({ summary: 'Buscar logs de notificação por charge_id' })
  @ApiParam({ name: 'chargeId', description: 'ID da cobrança' })
  @ApiResponse({
    status: 200,
    description: 'Logs de notificação para a cobrança especificada',
  })
  async getNotificationLogsByChargeId(@Param('chargeId') chargeId: string) {
    const logs = await this.notificationLogModel
      .find({ charge_id: chargeId })
      .sort({ createdAt: -1 })
      .exec();

    return {
      charge_id: chargeId,
      logs,
      total: logs.length,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas dos logs de notificação' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas dos logs',
    schema: {
      type: 'object',
      properties: {
        total_logs: { type: 'number' },
        today_logs: { type: 'number' },
        status_counts: { type: 'object' },
        recent_logs: { type: 'array' },
      },
    },
  })
  async getNotificationStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, statusCounts, recentLogs] = await Promise.all([
      this.notificationLogModel.countDocuments(),
      this.notificationLogModel.countDocuments({ createdAt: { $gte: today } }),
      this.notificationLogModel.aggregate([
        { $group: { _id: '$new_status', count: { $sum: 1 } } },
      ]),
      this.notificationLogModel.find().sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    return {
      total_logs: totalLogs,
      today_logs: todayLogs,
      status_counts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recent_logs: recentLogs,
    };
  }
}
