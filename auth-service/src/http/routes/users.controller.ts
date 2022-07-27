import { isAfter } from 'date-fns'

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { EncryptionProvider } from '../../providers/encryption.provider'
import { HashProvider } from '../../providers/hash.provider'
import { RefreshTokenService } from '../../services/refresh-token.service'
import { UsersService } from '../../services/users.service'
import { CurrentUser } from '../auth/current-user'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../auth/jwt.strategy'
import { RefreshDto } from '../dtos/refresh.dto'
import { SignInDto } from '../dtos/signin.dto'
import { SignUpDto } from '../dtos/signup.dto'

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly encryptionProvider: EncryptionProvider,
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

    await this.refreshTokenService.deleteAllUserTokens(user.id)

    const refreshToken = await this.refreshTokenService.createToken(user)

    return {
      access_token,
      refresh_token: refreshToken.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
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

  @Post('/refresh')
  async refresh(@Body() { refresh_token }: RefreshDto) {
    const refreshToken = await this.refreshTokenService.getToken(refresh_token)

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid token')
    }

    const tokenHasExpired = isAfter(new Date(), refreshToken.expiresAt)

    if (tokenHasExpired) {
      throw new UnauthorizedException('Token expired, sign in to application')
    }

    const decryptedEmail = this.encryptionProvider.decrypt(refreshToken.token)

    const user = await this.usersService.getUserByEmail(decryptedEmail)

    if (!user) {
      throw new UnauthorizedException('Invalid user')
    }

    const { access_token } = await this.generateJwt(user)

    return { access_token }
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
