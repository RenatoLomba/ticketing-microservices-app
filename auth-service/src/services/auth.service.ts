import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

type User = {
  id: string
  name: string
  email: string
}

type JwtPayload = {
  sub: string
  name: string
  email: string
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJwt(user: User) {
    const payload = { name: user.name, email: user.email }
    return {
      access_token: this.jwtService.sign(payload, {
        subject: user.id,
      }),
    }
  }

  async verifyJwt(token: string) {
    const payload = this.jwtService.verify(token) as JwtPayload
    return { sub: payload.sub, email: payload.email, name: payload.name }
  }
}
