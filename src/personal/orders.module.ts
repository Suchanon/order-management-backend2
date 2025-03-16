import { Module } from '@nestjs/common';
import { OrdersService } from './services/order.service';
import { OrdersController } from './controllers/orders.controller'

//--
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from "./models/order.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrderModule { }
