import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { User } from './jwt.strategy'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(
    err: unknown,
    user: TUser,
    info: { message: string },
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(info.message.replace(/ /g, '.').toLowerCase())
      )
    }

    return user
  }
}
