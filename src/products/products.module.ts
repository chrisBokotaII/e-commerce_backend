import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Review } from './entities/reviex.entity';
import { CategoryService } from './category.service';
import { ReviewService } from './review.service';
import { CategoryController } from './category.controller';
import { ReviewController } from './review.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Review]), UsersModule],
  controllers: [ProductsController, CategoryController, ReviewController],
  providers: [ProductsService, CategoryService, ReviewService],
  exports: [ProductsService, UsersModule],
})
export class ProductsModule {}
