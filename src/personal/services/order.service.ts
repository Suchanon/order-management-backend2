import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../models/order.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
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
}