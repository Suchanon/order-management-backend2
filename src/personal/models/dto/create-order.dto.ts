import { IsString, IsEmail, IsNumber, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class CreateOrderItemDto {
  @IsString()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsEnum(['pending', 'completed', 'canceled'])
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}