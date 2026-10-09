import { Injectable } from '@nestjs/common';

import { FeedbackRating } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    const message = dto.message?.trim();

    return this.prisma.feedback.create({
      data: {
        rating: dto.rating,
        message: message || null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        rating: true,
        message: true,
        createdAt: true,
      },
    });
  }

  async getStatistics() {
    const [total, positive, negative] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.count({
        where: { rating: FeedbackRating.POSITIVE },
      }),
      this.prisma.feedback.count({
        where: { rating: FeedbackRating.NEGATIVE },
      }),
    ]);

    return {
      total,
      positive,
      negative,
    };
  }
}
