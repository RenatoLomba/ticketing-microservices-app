import { Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IGetUserOrdersHandlerDto {
  userId: string
}

@Injectable()
export class GetUserOrdersHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: IGetUserOrdersHandlerDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        status: true,
      },
    })

    return orders
  }
}
