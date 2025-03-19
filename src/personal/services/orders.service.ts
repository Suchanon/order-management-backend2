import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
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
        try {
            const result = await this.orderRepository
                .createQueryBuilder('o')
                .select([
                    'o.id AS "orderId"',
                    'o.userId AS "userId"',
                    'u.name AS "customerName"',
                    'o.created_at AS "createdAt"',
                    `json_agg(
        json_build_object(
          'orderItemId', oi.id,
          'productName', oi.productName,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS items`,
                ])
                .innerJoin('o.user', 'u') // Join กับ users
                .leftJoin('o.orderItems', 'oi') // Join กับ order_items
                .groupBy('o.id, u.name, o.created_at')
                .orderBy('o.created_at', 'DESC')
                .getRawMany();
            return result;
        } catch (err) {
            throw err
        }
    }

    async removeOrderById(id: number) {
        try {
            const result = await this.orderRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`Order with ID ${id} not found`);
            }
            return id
        } catch (err) {
            throw err
        }

    }

    async createOrder(createOrderDto: CreateOrderDto) {

        try {
            const createOrderDetail = this.dataSource.transaction(async (manager) => {

                // Check if user exists
                let user = await manager.findOne(User, {
                    where: { name: createOrderDto.user.name },
                });

                // If user does not exist, create a new one
                if (!user) {
                    user = manager.create(User, {
                        name: createOrderDto.user.name // Ensure the name is provided
                    });
                    user = await manager.save(user);
                }

                // Create Order
                const order = manager.create(Orders, {
                    userId: user.id
                });
                const savedOrder = await manager.save(order);

                // Insert Order Items
                const orderItems = createOrderDto.orderItems.map((item) =>
                    manager.create(OrderItem, {
                        orderId: savedOrder.id,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                    })
                );
                return {
                    userId: user.id,
                    orderId: savedOrder.id,
                    orderItems: await manager.save(orderItems),
                };
            });
            return await createOrderDetail
        } catch (err) {
            throw err
        }

    }

    async updateFullOrder(orderData: any) {
        try {
            const updatedOrderId = this.dataSource.transaction(async (manager) => {
                const { orderId, userId, customerName, items } = orderData;
                const order = await manager.findOne(Orders, { where: { id: orderId, user: { id: userId } } });
                if (!order) throw new NotFoundException('Order not found');

                await this.updateUser(manager, userId, customerName);
                await this.updateOrderItems(manager, orderId, items);
                return orderId
            });
            return updatedOrderId
        } catch (err) {
            throw err
        }
    }

    //Separate function for updating User
    async updateUser(manager: EntityManager, userId: number, name: string) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.name = name;
        await manager.save(user);
    }

    //Separate function for updating Order Items
    async updateOrderItems(manager: EntityManager, orderId: number, items: any[]) {
        for (const item of items) {
            const orderItem = await manager.findOne(OrderItem, { where: { id: item.orderItemId, order: { id: orderId } } });
            if (!orderItem) throw new NotFoundException(`Order item with ID ${item.orderItemId} not found`);

            orderItem.productName = item.productName;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            await manager.save(orderItem);
        }
    }

}