import { IsNotEmpty, IsString } from 'class-validator'

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  externalId: string
}
