import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsNumber() @Type(() => Number) productId: number;

  @IsNumber() @Min(1) @Type(() => Number) quantity: number;

  @IsOptional() @IsString() size?: string;

  @IsOptional() @IsString() color?: string;
}
