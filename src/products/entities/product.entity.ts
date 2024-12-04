import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Review } from './reviex.entity';
import { OrderProducts } from 'src/orders/entities/ordrproducts.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;
  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories: Category[];
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
  @OneToMany(() => OrderProducts, (orderProducts) => orderProducts.product)
  orderProducts: OrderProducts[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
