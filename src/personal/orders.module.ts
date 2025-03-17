import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller'

//--
import { TypeOrmModule } from '@nestjs/typeorm';

import { Orders } from "./models/orders.entity"
import { User } from './models/user.entity';
import { OrderItem } from './models/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orders, User, OrderItem])],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrderModule { }
