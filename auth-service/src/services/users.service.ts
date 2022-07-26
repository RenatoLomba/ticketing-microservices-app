import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '../database/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getUserById() {
    return 'Im User'
  }

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    })
  }
}
