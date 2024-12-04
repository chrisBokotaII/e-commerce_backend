import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { paginationProdDto } from './dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = createProductDto.categoryIds.map(
      async (id: string) => await this.categoryService.findOne(id),
    );
    const product = new Product();
    product.name = createProductDto.name;
    product.description = createProductDto.description;
    product.price = createProductDto.price;
    product.categories = await Promise.all(category);
    product.stockQuantity = createProductDto.stockQuantity;
    product.imageUrl = createProductDto.imageUrl;
    await this.productRepository.save(product);
    return product;
  }

  async findAll(paginationDto: paginationProdDto) {
    const { page, limit, sort, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query = this.productRepository.createQueryBuilder('product');
    if (search) {
      query.where(
        'product.name like :search OR product.description like :search',
        { search: `%${search}%` },
      );
    }
    if (sort) {
      query.orderBy(`product.rating`, sort);
    }
    const [products, total] = await query
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.reviews', 'review')
      .leftJoinAndSelect('review.user', 'user')

      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        reviews: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    product.name = updateProductDto.name;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;
    return this.productRepository.save(product);
  }
  async updateStock(id: string, stock: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    product.stockQuantity = stock;
    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOneOrFail({
      where: { id },
    });
    await this.productRepository.remove(product);
    return { message: `Product #${id} removed successfully` };
  }

  async findMany(ids: string[]) {
    // Fetch all products in a single query
    const products = await this.productRepository.find({
      where: { id: In(ids) },
    });

    // Validate that all requested IDs were found
    const foundIds = products.map((product) => product.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));

    if (missingIds.length) {
      throw new NotFoundException(
        `Products with IDs ${missingIds.join(', ')} not found`,
      );
    }

    return products;
  }
}
