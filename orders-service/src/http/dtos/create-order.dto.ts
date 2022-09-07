import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string
}
