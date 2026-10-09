import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { FeedbackRating } from '../../../generated/prisma/client.js';

export class CreateFeedbackDto {
  @IsEnum(FeedbackRating)
  rating: FeedbackRating;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
