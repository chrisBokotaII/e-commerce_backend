import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/entities/product.entity';
interface CartProduct {
  productId: string;
  quantity: number;
}

interface EnrichedCartProduct {
  product: Product; // Replace with the actual Product entity/interface
  quantity: number;
  price: string; // Assuming price is stored as a string
  total: string;
}

export interface Icart {
  display: EnrichedCartProduct[];
  total: number;
}

@Injectable()
export class CartsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly productService: ProductsService,
  ) {}
  async create(createCartDto: CreateCartDto, userId: string) {
    const cartFromCache = await this.cacheManager.get<string>(userId);
    let cart;

    if (cartFromCache) {
      cart = JSON.parse(cartFromCache);

      const product = cart.products.find(
        (p) => p.productId === createCartDto.productId,
      );
      if (product) {
        product.quantity += createCartDto.quantity;
      } else {
        cart.products.push(createCartDto);
      }
    } else {
      cart = { products: [createCartDto] };
    }

    await this.cacheManager.set(userId, JSON.stringify(cart));

    return { message: 'Cart updated successfully', cart };
  }
  async findOne(userId: string): Promise<Icart | []> {
    // Fetch cart from cache
    const carts = await this.cacheManager.get<string>(userId);
    if (!carts) {
      return [];
    }

    const cart = JSON.parse(carts);
    const productIds = cart.products.map((p: CartProduct) => p.productId);

    // Fetch all products in one call
    const products = await this.productService.findMany(productIds);

    // Map products for efficient lookups
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // Enrich cart with product details
    const display = cart.products.map((p: CartProduct) => {
      const product = productMap.get(p.productId);
      if (!product) {
        throw new Error(`Product with ID ${p.productId} not found`);
      }
      const total = (product.price * p.quantity).toFixed(2);
      return {
        product,
        quantity: p.quantity,
        price: product.price,
        total,
      };
    });

    // Calculate the total price of the cart
    const total = display.reduce((acc: number, curr) => {
      return acc + parseFloat(curr.total);
    }, 0);

    return { display, total };
  }

  async updateQuantity(userId: string, productId: string) {
    const dataFromCache = await this.cacheManager.get<string>(userId);

    if (!dataFromCache) {
      throw new NotFoundException({
        message: 'Cart not found',
        success: false,
      });
    }

    const cart = JSON.parse(dataFromCache);

    const product = cart.products.find((p) => p.productId === productId);

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found in cart',
        success: false,
      });
    }

    product.quantity++;

    await this.cacheManager.set(userId, JSON.stringify(cart));

    return {
      message: 'Cart updated successfully',
      success: true,
      updatedCart: cart,
    };
  }
  async removeFromCart(userId: string, productId: string) {
    const dataFromCache = await this.cacheManager.get<string>(userId);

    if (!dataFromCache) {
      throw new NotFoundException({
        message: 'Cart not found',
        success: false,
      });
    }

    const cart = JSON.parse(dataFromCache);

    const product = cart.products.find((p) => p.productId === productId);

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found in cart',
        success: false,
      });
    }

    cart.products = cart.products.filter((p) => p.productId !== productId);

    await this.cacheManager.set(userId, JSON.stringify(cart));

    return {
      message: 'Cart updated successfully',
      success: true,
      updatedCart: cart,
    };
  }
  async decrementTheQuantity(userId: string, productId: string) {
    const dataFromCache = await this.cacheManager.get<string>(userId);

    if (!dataFromCache) {
      throw new NotFoundException({
        message: 'Cart not found',
        success: false,
      });
    }

    const cart = JSON.parse(dataFromCache);

    const product = cart.products.find((p) => p.productId === productId);

    if (!product) {
      throw new NotFoundException({
        message: 'Product not found in cart',
        success: false,
      });
    }

    product.quantity--;

    await this.cacheManager.set(userId, JSON.stringify(cart));

    return {
      message: 'Cart updated successfully!!',
      success: true,
      updatedCart: cart,
    };
  }
  async clearCart(userId: string) {
    // Remove the cart from cache
    await this.cacheManager.del(userId);

    // Return a success message
    return { message: 'Cart cleared successfully', success: true };
  }
}
