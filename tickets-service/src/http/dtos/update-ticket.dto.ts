import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class UpdateTicketDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price?: number
}
