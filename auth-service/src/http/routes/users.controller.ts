import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common'

import { AuthService } from '../../services/auth.service'
import { CurrentUser } from '../auth/current-user'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../auth/jwt.strategy'
import { RefreshDto } from '../dtos/refresh.dto'
import { SignInDto } from '../dtos/signin.dto'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  currentUser(@CurrentUser() user: User) {
    return {
      ...user,
    }
  }

  @Post('/signin')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/signout')
  @HttpCode(204)
  async signOut(@CurrentUser() user: User) {
    return this.authService.signOut(user.id)
  }

  @Post('/refresh')
  @HttpCode(200)
  async refresh(@Body() { refresh_token }: RefreshDto) {
    return this.authService.refresh(refresh_token)
  }
}
