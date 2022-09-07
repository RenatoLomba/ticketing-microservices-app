import { Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IGetUserPendingOrdersHandlerDto {
  userId: string
}

@Injectable()
export class GetUserPendingOrdersHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: IGetUserPendingOrdersHandlerDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        status: 'PENDING',
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
