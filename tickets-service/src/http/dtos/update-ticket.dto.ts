import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateTicketDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsOptional()
  price?: number
}
