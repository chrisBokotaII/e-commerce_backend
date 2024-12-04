import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PaymentService } from './payment.service';
import { AuthGuard } from 'src/users/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto, @Request() req) {
    const { sub } = req.user;
    return this.cartsService.create(createCartDto, sub);
  }

  @Get()
  findOne(@Request() req): Promise<any> {
    const { sub } = req.user;
    return this.cartsService.findOne(sub);
  }

  @Post('addQuantity')
  update(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.updateQuantity(
      req.user.sub,
      updateCartDto.productId,
    );
  }

  @Post('removeProduct')
  removeProduct(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.removeFromCart(
      req.user.sub,
      updateCartDto.productId,
    );
  }
  @Post('clearCart')
  clearCart(@Request() req) {
    return this.cartsService.clearCart(req.user.sub);
  }
  @Post('decQuantity')
  decQuantity(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.decrementTheQuantity(
      req.user.sub,
      updateCartDto.productId,
    );
  }
  @Post('checkout')
  checkout(@Request() req) {
    return this.paymentService.checkout(req.user.sub);
  }
  @Post('complete')
  complete(@Body() sessionId: any) {
    return this.paymentService.completePayment(sessionId.sessionId);
  }
}
