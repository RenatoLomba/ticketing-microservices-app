import { addHours } from 'date-fns'

import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

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

  async createToken(user: User) {
    const token = this.encryptionProvider.crypt(user.email)

    return this.prisma.refreshToken
      .create({
        select: {
          id: true,
          token: true,
        },
        data: {
          token,
          userId: user.id,
          expiresAt: addHours(new Date(), 12),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002':
              throw new ForbiddenException('Duplicate user token')
            case 'P2003':
              throw new ForbiddenException('User not found')
          }
        }

        throw error
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
