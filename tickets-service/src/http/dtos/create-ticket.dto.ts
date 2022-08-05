import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  price: number
}
