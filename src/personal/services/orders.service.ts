import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Orders } from '../models/orders.entity';
import { User } from '../models/user.entity';
import { OrderItem } from '../models/order-item.entity';
import { CreateOrderDto } from "../models/dto/create-order.dto"

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Orders)
        private readonly orderRepository: Repository<Orders>,
        // @InjectRepository(User)
        // private readonly userRepository: Repository<User>,
        // @InjectRepository(OrderItem)
        // private orderItemRepository: Repository<OrderItem>,
        private dataSource: DataSource,
    ) { }

    async getOrdersWithDetails() {
        console.log("call order!!!")
        // Using TypeORM's QueryBuilder
        const result = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                'o.id AS order_id',
                'u.name AS customer_name',
                'u.email AS customer_email',
                'o.total_price AS total_price',
                'o.status AS status',
                'o.created_at',
                `json_agg(
            json_build_object(
              'order_item_id', oi.id,
              'customer_email', u.email,
              'product_name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) AS items`,
            ])
            .innerJoin('o.user', 'u') // Join กับ users
            .leftJoin('o.orderItems', 'oi') // Join กับ order_items
            .groupBy('o.id, u.name, u.email, total_price, o.status, o.created_at')
            .orderBy('o.created_at', 'DESC')
            .getRawMany(); // ดึงข้อมูลในรูปแบบ raw JSON

        return result;
    }

    async removeOrderById(id: number) {
        console.log("Removeing id:", id)
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            console.log(`Order with ID ${id} not found`)
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return id
    }

    async createOrder(createOrderDto: CreateOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log("Service createOrderDto-->", createOrderDto)

            // Insert user
            const user = queryRunner.manager.create(User, {
                name: createOrderDto.user.name,
                email: createOrderDto.user.email,
            });
            const savedUser = await queryRunner.manager.save(user);

            // Insert order
            const order = queryRunner.manager.create(Orders, {
                userId: savedUser.id,
                totalPrice: createOrderDto.totalPrice,
                status: createOrderDto.status
            });
            const savedOrder = await queryRunner.manager.save(order);

            // Insert order items
            const orderItems: { id: number }[] = [];
            for (const item of createOrderDto.orderItems) {
                const orderItem = queryRunner.manager.create(OrderItem, {
                    orderId: savedOrder.id,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                });
                const savedOrderItem = await queryRunner.manager.save(orderItem);
                orderItems.push({ id: savedOrderItem.id });
            }
            // Commit transaction
            await queryRunner.commitTransaction();


            return {
                userId: savedUser.id,
                orderId: savedOrder.id,
                orderItems,
            };
            //   return {
            //     message: 'Order created successfully',
            //     data: {},
            // };
        } catch (err) {
            // Rollback transaction if failed
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Release the query runner
            await queryRunner.release();
        }
    }
}