/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Request() req: any,
    @Body()
    body: {
      jobId: string;
      revieweeId: string;
      targetType: any;
      rating: number;
      comment?: string;
    },
  ) {
    return this.reviewsService.createReview({
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      reviewerId: req.user.id,
      ...body,
    });
  }

  @Get('user/:id')
  async getReviewsForUser(@Param('id') id: string) {
    return this.reviewsService.getReviewsForUser(id);
  }
}
