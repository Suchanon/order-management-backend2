import { Controller, Get, Param, Delete, Post, HttpStatus, HttpCode, Body } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../models/dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

   //3.การแสดงรายการคำสั่งซื้อ
  @Get()
  async getOrders() {
    return await this.ordersService.getOrdersWithDetails();
  }

  //4.การลบคำสั่งซื้อ
  @Delete(':id')
  async findOne(@Param('id') id: number) {
    console.log("Calling Delete on id:", id)
    return await this.ordersService.removeOrderById(id);
  }

  //1. การสร้างคำสั่งซื้อใหม่
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto ){
    console.log("Calling createOrder on data:", createOrderDto)
    const result = await this.ordersService.createOrder(createOrderDto);
    return {
      message: 'Order created successfully',
      data: result,
    };
  }
}