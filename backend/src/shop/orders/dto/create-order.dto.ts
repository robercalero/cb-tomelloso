import { IsString, IsNumber, IsOptional, IsArray, IsEmail, Min, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber() @Type(() => Number) productId: number;
  @IsNumber() @Min(1) @Type(() => Number) quantity: number;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() color?: string;
}

export class CreateOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString() @Length(2, 100) shippingName: string;

  @IsEmail() shippingEmail: string;

  @IsOptional() @IsString() shippingPhone?: string;

  @IsString() @Length(5, 300) shippingAddress: string;

  @IsString() @Length(2, 100) shippingCity: string;

  @IsString() @Length(4, 10) shippingPostalCode: string;

  @IsOptional() @IsString() shippingCountry?: string;

  @IsOptional() @IsString() notes?: string;

  @IsOptional() @IsString() sessionId?: string;
}
