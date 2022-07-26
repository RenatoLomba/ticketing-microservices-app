import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  password: string
}
