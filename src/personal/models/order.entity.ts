import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../models/user.entity';
import { OrderItem } from '../models/order-item.entity';

type Status = 'pending' | 'confirmed' | 'shipped'| 'delivered'| 'canceled'
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_price',  type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ name: 'status', default: 'pending' })
  status: Status;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // @Column({ name: 'user_id' })
  // userId: number;

  @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}