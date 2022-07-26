import { Controller, Get, Post } from '@nestjs/common'

import { UsersService } from '../../services/users.service'

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
  signUp() {
    return 'Sign up'
  }

  @Post('signout')
  signOut() {
    return 'Sign out'
  }
}
