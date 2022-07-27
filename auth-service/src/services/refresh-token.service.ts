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

  async deleteAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    })
  }

  getToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      select: {
        id: true,
        token: true,
        userId: true,
        expiresAt: true,
      },
      where: { token },
    })
  }
}
