import { IsDecimal, IsNotEmpty, IsString } from 'class-validator'

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsDecimal()
  @IsNotEmpty()
  price: string
}
