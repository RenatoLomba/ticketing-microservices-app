import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'
import { HashProvider } from '../providers/hash.provider'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashProvider: HashProvider,
  ) {}

  getUserById(id: string) {
    return this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
      },
      where: { id },
    })
  }

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
      where: { email },
    })
  }

  async createUser({ email, name, password }: Prisma.UserCreateInput) {
    const hashedPassword = await this.hashProvider.toHash(password)

    return this.prisma.user
      .create({
        select: {
          id: true,
          name: true,
          email: true,
        },
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Duplicate user email')
          }
        }

        throw error
      })
  }
}
