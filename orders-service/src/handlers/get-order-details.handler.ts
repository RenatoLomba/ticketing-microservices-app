import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IGetOrderDetailsHandlerDto {
  orderId: string
  userId: string
}

@Injectable()
export class GetOrderDetailsHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ orderId, userId }: IGetOrderDetailsHandlerDto) {
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

    if (!order) {
      throw new BadRequestException('Order request does not exists')
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'The order requested cannot be accessed by this user',
      )
    }

    return order
  }
}
