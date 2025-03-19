import {
  Controller, Put, Get, Param, Delete,
  Post, HttpStatus, HttpCode, Body,
  BadRequestException, ServiceUnavailableException, NotFoundException,
  InternalServerErrorException,
  UseGuards 
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../models/dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt')) 
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  //3.การแสดงรายการคำสั่งซื้อ
  @Get()
  async getOrders() {
    try {
      const orderList = await this.ordersService.getOrdersWithDetails();
      return orderList
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Database connection failed');
      }
      if (err.name === 'QueryFailedError') {
        throw new InternalServerErrorException('Database query failed');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  //4.การลบคำสั่งซื้อ
  @Delete(':id')
  async findOne(@Param('id') id: number) {
    try {
      const deletedOderId = await this.ordersService.removeOrderById(id)
      return deletedOderId
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // 1. การสร้างคำสั่งซื้อใหม่
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      const createdOrderDetail = await this.ordersService.createOrder(createOrderDto);
      return createdOrderDetail
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Database connection failed');
      }
      if (err.name === 'QueryFailedError') {
        throw new BadRequestException(`Invalid data provided: ${err.detail}`);
      }
      throw new InternalServerErrorException('Something went wrong while creating the order');
    }

  }

  @Put('/full-update')
  async updateFullOrder(@Body() orderData: any) {
    try {
      const updatedOrderId = await this.ordersService.updateFullOrder(orderData);
      return updatedOrderId
    } catch (err) {
      if (err.name === 'QueryFailedError') {
        throw new BadRequestException(`Invalid data provided: ${err.detail}`);
      }
      if (err instanceof BadRequestException) {

        throw new BadRequestException(err.message);
      }
      throw new InternalServerErrorException('Something went wrong while updating the order');
    }

  }
}