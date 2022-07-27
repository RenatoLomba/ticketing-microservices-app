import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class SignInDto {
  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  password: string
}
