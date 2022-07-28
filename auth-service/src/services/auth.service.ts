import { isAfter } from 'date-fns'

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { EncryptionProvider } from '../providers/encryption.provider'
import { HashProvider } from '../providers/hash.provider'
import { RefreshTokenService } from './refresh-token.service'
import { UsersService } from './users.service'

type User = {
  id: string
  name: string
  email: string
}

type SignUpData = {
  email: string
  name: string
  password: string
}

type SignInData = {
  email: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly encryptionProvider: EncryptionProvider,
  ) {}

  async signUp(data: SignUpData) {
    const user = await this.usersService.getUserByEmail(data.email)

    if (!!user) {
      throw new BadRequestException('User already exists')
    }

    const userCreated = await this.usersService.createUser(data)

    const { access_token } = await this.generateJwt(userCreated)

    const refreshToken = await this.refreshTokenService.createToken(userCreated)

    return {
      access_token,
      refresh_token: refreshToken.token,
      user: userCreated,
    }
  }

  async signIn(data: SignInData) {
    const user = await this.usersService.getUserByEmail(data.email)

    if (!user) {
      throw new BadRequestException('Invalid email or password')
    }

    const passwordIsValid = await this.hashProvider.compare(
      data.password,
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

  async refresh(token: string) {
    const refreshToken = await this.refreshTokenService.getToken(token)

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

  async signOut(userId: string) {
    await this.refreshTokenService.deleteAllUserTokens(userId)
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
