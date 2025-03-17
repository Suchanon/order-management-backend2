import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';


@Entity('orders')
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_price',  type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'status', default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}