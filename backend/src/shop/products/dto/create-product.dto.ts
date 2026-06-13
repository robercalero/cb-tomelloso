import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductColorDto {
  @IsString() name: string;
  @IsString() hex: string;
}

export class CreateProductDto {
  @IsOptional() @IsNumber() @Type(() => Number)
  categoryId?: number;

  @IsString() @Length(2, 200) name: string;

  @IsString() @Length(2, 200) slug: string;

  @IsOptional() @IsString() description?: string;

  @IsNumber() @Min(0) @Type(() => Number) price: number;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) comparePrice?: number;

  @IsOptional() @IsArray() images?: string[];

  @IsOptional() @IsArray() sizes?: string[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors?: ProductColorDto[];

  @IsNumber() @Min(0) @Type(() => Number) stock: number;

  @IsOptional() @IsString() sku?: string;

  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional() @IsBoolean() isFeatured?: boolean;

  @IsOptional() @IsString() season?: string;

  @IsOptional() @IsArray() tags?: string[];
}
