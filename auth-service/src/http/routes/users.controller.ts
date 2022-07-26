import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'

import { UsersService } from '../../services/users.service'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

    return this.usersService.createUser(signUpDto)
  }

  @Post('signout')
  signOut() {
    return 'Sign out'
  }
}
