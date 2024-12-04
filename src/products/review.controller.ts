import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from './dto/review.dto';
import { AuthGuard } from 'src/users/auth/auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() reviewDto: ReviewDto, @Request() req) {
    const { sub } = req.user;
    return this.reviewService.create(reviewDto, sub);
  }
  @Get()
  findAll() {
    return this.reviewService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }
}
