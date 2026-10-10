import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { StatisticsService } from './statistics.service';

@Controller('admin/statistics')
@UseGuards(AdminJwtGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  getStatistics(@Query('days') days?: string) {
    const selectedDays = days === undefined ? 7 : Number(days);

    if (![1, 7, 30].includes(selectedDays)) {
      throw new BadRequestException('Ungültiger Zeitraum.');
    }

    return this.statisticsService.getStatistics(selectedDays);
  }
}
