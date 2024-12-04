/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CartsService } from './carts.service';
import { QueueService } from 'src/queue/queue.service';
import { OrdersService } from 'src/orders/orders.service';
const stripe = new Stripe(process.env.STRIPE_KEY);
interface displayProduct {
  product: { name: string; price: number };
  quantity: number;
  price: string;
}
interface Icart {
  display: displayProduct[];
  total: number;
}
@Injectable()
export class PaymentService {
  constructor(
    private readonly cartService: CartsService,
    private readonly queueService: QueueService,
    private readonly orderService: OrdersService,
  ) {}
  async checkout(userId: string) {
    const cart: Icart = (await this.cartService.findOne(userId)) as Icart;
    // const map = cart.display.map((product) => {
    //   return {
    //     price_data: {
    //       currency: 'usd',
    //       product_data: {
    //         name: product.product.name,
    //       },
    //       unit_amount: Math.round(product.product.price * 100),
    //     },
    //     quantity: product.quantity,
    //   };

    // });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      //@ts-ignore
      line_items: cart.display.map((product) => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.product.name,
            },
            unit_amount: Math.round(product.product.price * 100),
          },
          quantity: product.quantity,
        };
      }),
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    const order = await this.orderService.create(userId, session.id);
    if (!order) {
      throw new HttpException('cannot create order', 404);
    }

    return {
      message: 'queued',
      url: session.url,
      id: session.id,
      orderId: order.id,
    };
  }
  async completePayment(sessionId: string) {
    const check = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await this.orderService.getBySessionId(sessionId);
    console.log(order);

    if (check.payment_status === 'paid') {
      await this.orderService.update(order.id, 'shipping');
      await this.queueService.addToQueue({
        orderId: order.id,
        userEmail: order.user.email,
        message: 'your order is being delivred',
      });
      return { message: 'Payment successful' };
    } else if (check.payment_status === 'unpaid') {
      await this.orderService.cancled(order.id);
      return { message: 'Payment failed' };
    }
  }
}
