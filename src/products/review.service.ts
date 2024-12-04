import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/reviex.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from './products.service';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}
  async create(ReviewDto: ReviewDto, userId: string) {
    const user = await this.userService.findOneWithPasswors(userId);
    const product = await this.productService.findOne(ReviewDto.productId);
    const review = new Review();
    review.content = ReviewDto.comment;
    review.rating = ReviewDto.rating;
    review.product = product;
    review.user = user;
    await this.reviewRepository.save(review);

    return review;
  }

  async findAll() {
    return await this.reviewRepository.find();
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        product: true,
      },
    });
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    return `This action removes a #${id} review`;
  }
}
