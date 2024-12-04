import { Order } from 'src/orders/entities/order.entity';
import { Review } from 'src/products/entities/reviex.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ default: 'user', enum: ['user', 'admin'] })
  role: string;
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
  @OneToMany(() => Order, (orders) => orders.user)
  orders: Order[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date | string;
}
