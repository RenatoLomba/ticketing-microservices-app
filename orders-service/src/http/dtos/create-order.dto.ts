import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  externalId: string
}
