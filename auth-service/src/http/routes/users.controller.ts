import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { HashProvider } from '../../providers/hash.provider'
import { RefreshTokenService } from '../../services/refresh-token.service'
import { UsersService } from '../../services/users.service'
import { CurrentUser } from '../auth/current-user'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../auth/jwt.strategy'
import { SignInDto } from '../dtos/signin.dto'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  currentUser(@CurrentUser() user: User) {
    return {
      ...user,
    }
  }

  @Post('/signin')
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.usersService.getUserByEmail(signInDto.email)

    if (!user) {
      throw new BadRequestException('Invalid email or password')
    }

    const passwordIsValid = await this.hashProvider.compare(
      signInDto.password,
      user.password,
    )

    if (!passwordIsValid) {
      throw new BadRequestException('Invalid email or password')
    }
    const { access_token } = await this.generateJwt(user)

    return {
      access_token,
      user,
    }
  }

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.usersService.getUserByEmail(signUpDto.email)

    if (!!user) {
      throw new BadRequestException('User already exists')
    }

    const userCreated = await this.usersService.createUser(signUpDto)

    const { access_token } = await this.generateJwt(userCreated)

    const refreshToken = await this.refreshTokenService.createToken(userCreated)

    return {
      access_token,
      refresh_token: refreshToken.token,
      user: userCreated,
    }
  }

  @Post('/signout')
  signOut() {
    return 'Sign out'
  }

  private async generateJwt(user: User) {
    const payload = { name: user.name, email: user.email }
    return {
      access_token: this.jwtService.sign(payload, {
        subject: user.id,
      }),
    }
  }
}
