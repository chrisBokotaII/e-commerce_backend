import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { ProductsModule } from 'src/products/products.module';
import { PaymentService } from './payment.service';
import { QueueModule } from 'src/queue/queue.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ProductsModule, QueueModule, OrdersModule],
  controllers: [CartsController],
  providers: [CartsService, PaymentService],
  exports: [CartsService, PaymentService],
})
export class CartsModule {}
