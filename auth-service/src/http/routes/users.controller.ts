import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'

import { AuthService } from '../../services/auth.service'
import { UsersService } from '../../services/users.service'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/current')
  currentUser() {
    return this.usersService.getUserById()
  }

  @Post('signin')
  signIn() {
    return 'Sign in'
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.usersService.getUserByEmail(signUpDto.email)

    if (!!user) {
      throw new BadRequestException(['Invalid email or password'])
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
