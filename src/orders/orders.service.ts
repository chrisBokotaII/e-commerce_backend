import { HttpException, Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CartsService, Icart } from 'src/carts/carts.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly userService: UsersService,
    private readonly cacheService: CartsService,
  ) {}
  async create(userId: string, sessionId: string): Promise<Order> {
    // Step 1: Fetch the enriched cart
    try {
      const cart: Icart = (await this.cacheService.findOne(userId)) as Icart; // Use the improved `findOne` method
      if (!cart || cart.display.length === 0) {
        throw new Error('Cart is empty. Cannot create an order.');
      }

      // Step 2: Validate stock availability
      const insufficientStockItems = cart.display.filter(
        (item) => item.product.stockQuantity < item.quantity,
      );

      if (insufficientStockItems.length > 0) {
        const errorMessages = insufficientStockItems.map(
          (item) =>
            `Product ${item.product.name} has only ${item.product.stockQuantity} in stock, but ${item.quantity} were requested.`,
        );
        throw new HttpException(
          {
            message: `Order cannot be processed: \n${errorMessages.join('\n')}`,
          },
          400,
        );
      }

      // Step 3: Update stock quantities
      const stockUpdates = cart.display.map((item) => ({
        id: item.product.id,
        newStock: item.product.stockQuantity - item.quantity,
      }));

      // Bulk update stock ( ProductsService)
      const stockUpdatePromises = stockUpdates.map(async (update) => {
        return await this.productsService.updateStock(
          update.id,
          update.newStock,
        );
      });
      await Promise.all(stockUpdatePromises);

      // Step 4: Create order items
      const orderProducts = cart.display.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        subtotal: parseFloat(item.total),
      }));

      // Step 5: Fetch the user
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      // Step 6: Create the order entity
      const order = this.orderRepository.create({
        user,
        orderProducts,
        total: parseFloat(cart.total.toFixed(2)),
        sessionId,
      });

      // Save the order in the database
      const savedOrder = await this.orderRepository.save(order);
      console.log(savedOrder);

      // Step 7: Clear the cart
      // await this.cacheService.clearCart(userId);

      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Error creating order');
    }
  }

  async findAll() {
    return await this.orderRepository.find({
      relations: {
        orderProducts: {
          product: true,
        },
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({ where: { id } });
  }

  async update(id: string, status: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    order.status = status;
    await this.orderRepository.save(order);
    return `This action updates a #${id} order`;
  }
  async getBySessionId(sessionId: string) {
    return await this.orderRepository.findOne({
      where: { sessionId },
      relations: {
        user: true,
      },
    });
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    await this.orderRepository.remove(order);
    return `This action removes a #${id} order`;
  }
  async cancled(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    order.status = 'cancled';
    await this.orderRepository.save(order);
    // update the stock
    const cart: Icart = (await this.cacheService.findOne(
      order.user.id,
    )) as Icart; // Use the improved `findOne` method
    if (!cart || cart.display.length === 0) {
      throw new Error('Cart is empty. Cannot create an order.');
    }
    const stockUpdates = cart.display.map((item) => ({
      id: item.product.id,
      newStock: item.product.stockQuantity + item.quantity,
    }));

    // Bulk update stock ( ProductsService)
    const stockUpdatePromises = stockUpdates.map(async (update) => {
      return await this.productsService.updateStock(update.id, update.newStock);
    });
    await Promise.all(stockUpdatePromises);

    return `This action cancled a #${id} order`;
  }
}
