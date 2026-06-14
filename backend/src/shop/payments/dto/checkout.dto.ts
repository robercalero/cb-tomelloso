import { IsString, IsOptional, IsEmail, Length } from 'class-validator';

export class CheckoutDto {
  @IsString() @Length(2, 100) shippingName: string;

  @IsEmail() shippingEmail: string;

  @IsOptional() @IsString() shippingPhone?: string;

  @IsString() @Length(5, 300) shippingAddress: string;

  @IsString() @Length(2, 100) shippingCity: string;

  @IsString() @Length(4, 10) shippingPostalCode: string;

  @IsOptional() @IsString() shippingCountry?: string;

  @IsOptional() @IsString() notes?: string;

  @IsString() sessionId: string;
}
