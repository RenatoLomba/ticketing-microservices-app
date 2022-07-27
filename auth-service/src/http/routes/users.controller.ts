import { HashProvider } from 'src/providers/hash.provider'

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'

import { AuthService } from '../../services/auth.service'
import { UsersService } from '../../services/users.service'
import { SignInDto } from '../dtos/signin.dto'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly hashProvider: HashProvider,
  ) {}

  @Get('/current')
  currentUser() {
    return this.usersService.getUserById()
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.usersService.getUserByEmail(signInDto.email)

    if (!user) {
      throw new BadRequestException(['Invalid email or password'])
    }

    const passwordIsValid = await this.hashProvider.compare(
      signInDto.password,
      user.password,
    )

    if (!passwordIsValid) {
      throw new BadRequestException(['Invalid email or password'])
    }
    const { access_token } = await this.authService.generateJwt(user)

    return {
      access_token,
      user,
    }
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.usersService.getUserByEmail(signUpDto.email)

    if (!!user) {
      throw new BadRequestException(['User already exists'])
    }

    const userCreated = await this.usersService.createUser(signUpDto)

    const { access_token } = await this.authService.generateJwt(userCreated)

    return {
      access_token,
      user: userCreated,
    }
  }

  @Post('signout')
  signOut() {
    return 'Sign out'
  }
}
