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
        console.log("call order!!!")
        // Using TypeORM's QueryBuilder
        const result = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                'o.id AS "orderId"',
                'o.user_id AS "userId"',
                'u.name AS "customerName"',
                'u.email AS "customerEmail"',
                'o.total_price AS "totalPrice"',
                'o.status AS status',
                'o.created_at AS "createdAt"',
                `json_agg(
            json_build_object(
              'orderItemId', oi.id,
              'customerEmail', u.email,
              'productName', oi.product_name,
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

    // async createOrder(createOrderDto: CreateOrderDto) {
    //     const queryRunner = this.dataSource.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     try {
    //         console.log("Service createOrderDto-->", createOrderDto)

    //         // Insert user
    //         const user = queryRunner.manager.create(User, {
    //             name: createOrderDto.user.name,
    //             email: createOrderDto.user.email,

    //         });
    //         const savedUser = await queryRunner.manager.save(user);

    //         // Insert order
    //         const order = queryRunner.manager.create(Orders, {
    //             userId: savedUser.id,
    //             totalPrice: createOrderDto.totalPrice,
    //             status: createOrderDto.status
    //         });
    //         const savedOrder = await queryRunner.manager.save(order);

    //         // Insert order items
    //         const orderItems: { id: number }[] = [];
    //         for (const item of createOrderDto.orderItems) {
    //             const orderItem = queryRunner.manager.create(OrderItem, {
    //                 orderId: savedOrder.id,
    //                 productName: item.productName,
    //                 quantity: item.quantity,
    //                 price: item.price,
    //             });
    //             const savedOrderItem = await queryRunner.manager.save(orderItem);
    //             orderItems.push({ id: savedOrderItem.id });
    //         }
    //         // Commit transaction
    //         await queryRunner.commitTransaction();


    //         return {
    //             userId: savedUser.id,
    //             orderId: savedOrder.id,
    //             orderItems,
    //         };
    //         //   return {
    //         //     message: 'Order created successfully',
    //         //     data: {},
    //         // };
    //     } catch (err) {
    //         // Rollback transaction if failed
    //         await queryRunner.rollbackTransaction();
    //         throw err;
    //     } finally {
    //         // Release the query runner
    //         await queryRunner.release();
    //     }
    // }
    async createOrder(createOrderDto: CreateOrderDto) {
        return this.dataSource.transaction(async (manager) => {
            console.log("Service createOrderDto-->", createOrderDto);
    
            // 1️⃣ Check if user exists
            let user = await manager.findOne(User, {
                where: { email: createOrderDto.user.email },
            });
    
            // 2️⃣ If user does not exist, create a new one
            if (!user) {
                user = manager.create(User, {
                    name: createOrderDto.user.name, // Ensure the name is provided
                    email: createOrderDto.user.email,
                });
                user = await manager.save(user);
            }
    
            // 3️⃣ Create Order
            const order = manager.create(Orders, {
                userId: user.id,
                totalPrice: createOrderDto.totalPrice,
                status: createOrderDto.status,
            });
            const savedOrder = await manager.save(order);
    
            // 4️⃣ Insert Order Items
            const orderItems = createOrderDto.orderItems.map((item) =>
                manager.create(OrderItem, {
                    orderId: savedOrder.id,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                })
            );
    
            await manager.save(orderItems);
    
            return {
                userId: user.id,
                orderId: savedOrder.id,
                orderItems: orderItems.map((item) => ({ id: item.id })),
            };
        });
    }
    
    
    async updateFullOrder(orderData: any) {
        return this.dataSource.transaction(async (manager) => {
            const { order_id, user_id, customer_name, customer_email, total_price, status, items } = orderData;
    
            // 🔹 Step 1: Update User
            await this.updateUser(manager, user_id, customer_name, customer_email);
    
            // 🔹 Step 2: Update Order
            await this.updateOrder(manager, order_id, user_id, total_price, status);
    
            // 🔹 Step 3: Update Order Items
            await this.updateOrderItems(manager, order_id, items);
    
            return { message: 'Order updated successfully', order_id };
        });
    }
    
    // ✅ Separate function for updating User
    private async updateUser(manager: EntityManager, userId: number, name: string, email: string) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
    
        user.name = name;
        user.email = email;
        await manager.save(user);
    }
    
    // ✅ Separate function for updating Order
    private async updateOrder(manager: EntityManager, orderId: number, userId: number, totalPrice: number, status: string) {
        const order = await manager.findOne(Orders, { where: { id: orderId, user: { id: userId } } });
        if (!order) throw new NotFoundException('Order not found');
    
        order.totalPrice = totalPrice;
        order.status = status;
        await manager.save(order);
    }
    
    // ✅ Separate function for updating Order Items
    private async updateOrderItems(manager: EntityManager, orderId: number, items: any[]) {
        for (const item of items) {
            const orderItem = await manager.findOne(OrderItem, { where: { id: item.order_item_id, order: { id: orderId } } });
            if (!orderItem) throw new NotFoundException(`Order item with ID ${item.order_item_id} not found`);
    
            orderItem.productName = item.product_name;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;
            await manager.save(orderItem);
        }
    }

    // // ✅ Update User, Order, and Order Items in One Transaction
    // async updateFullOrder(orderData: any) {
    //     const updatedOrderId = this.dataSource.transaction(async (manager) => {
    //         const { order_id, user_id, customer_name, customer_email, total_price, status, items } = orderData;

    //         // 🔹 Step 1: Find the user
    //         let user = await manager.findOne(User, { where: { id: user_id } });
    //         if (!user) throw new NotFoundException('User not found');

    //         // 🔹 Step 2: Update User's Name
    //         user.name = customer_name;
    //         user.email = customer_email;
    //         await manager.save(user);

    //         // 🔹 Step 3: Find the Order
    //         let order = await manager.findOne(Orders, { where: { id: order_id, user: { id: user.id } } });
    //         if (!order) throw new NotFoundException('Order not found');

    //         // 🔹 Step 4: Update Order
    //         order.totalPrice = total_price;
    //         order.status = status;
    //         await manager.save(order);

    //         // 🔹 Step 5: Update Order Items
    //         for (const item of items) {
    //             let orderItem = await manager.findOne(OrderItem, { where: { id: item.order_item_id, order: { id: order.id } } });
    //             if (!orderItem) throw new NotFoundException(`Order item with ID ${item.order_item_id} not found`);

    //             orderItem.productName = item.product_name;
    //             orderItem.quantity = item.quantity;
    //             orderItem.price = item.price;
    //             await manager.save(orderItem);
    //         }
    //         return { message: 'Order updated successfully', order_id };
    //     });

    //     return updatedOrderId
    // }

}