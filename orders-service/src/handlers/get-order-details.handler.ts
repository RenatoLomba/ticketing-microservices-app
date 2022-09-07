import { Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IGetOrderDetailsHandlerDto {
  orderId: string
}

@Injectable()
export class GetOrderDetailsHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ orderId }: IGetOrderDetailsHandlerDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        status: true,
        product: true,
        productId: true,
      },
    })

    return order
  }
}
