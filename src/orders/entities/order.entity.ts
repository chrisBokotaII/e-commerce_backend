import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProducts } from './ordrproducts.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => User, (user) => user.orders)
  user: User;
  @OneToMany(() => OrderProducts, (oderProducts) => oderProducts.order, {
    cascade: true,
  })
  @JoinColumn()
  orderProducts: OrderProducts[];
  @Column({ type: 'decimal' })
  total: number;
  @Column({
    default: 'pending',
    enum: ['pending', 'delivred', 'shipped', 'canceled'],
  })
  status: string;
  @Column({ nullable: true })
  sessionId: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
