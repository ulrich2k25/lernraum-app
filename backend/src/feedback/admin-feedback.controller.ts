import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { FeedbackService } from './feedback.service';

@Controller('admin/feedback')
@UseGuards(AdminJwtGuard)
export class AdminFeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.feedbackService.getStatistics();
  }
}
