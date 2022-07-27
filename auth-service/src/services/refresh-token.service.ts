import { addHours } from 'date-fns'

import { Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'
import { EncryptionProvider } from '../providers/encryption.provider'

type User = {
  id: string
  email: string
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionProvider: EncryptionProvider,
  ) {}

  createToken(user: User) {
    const token = this.encryptionProvider.crypt(user.email)

    return this.prisma.refreshToken.create({
      select: {
        id: true,
        token: true,
      },
      data: {
        token,
        userId: user.id,
        expiresAt: addHours(new Date(), 24),
      },
    })
  }
}
