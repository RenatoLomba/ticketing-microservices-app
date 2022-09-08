import { Injectable } from '@nestjs/common'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IValidateProductIsReservedHandlerDto {
  productId: string
}

@Injectable()
export class ValidateProductIsReservedHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ productId }: IValidateProductIsReservedHandlerDto) {
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        productId,
        status: {
          not: ORDER_STATUS.CANCELLED,
        },
      },
      select: {
        id: true,
      },
    })

    return !!existingOrder
  }
}
