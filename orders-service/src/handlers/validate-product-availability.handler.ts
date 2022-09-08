import { BadRequestException, Injectable } from '@nestjs/common'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IValidateProductAvailabilityHandlerDto {
  productId: string
}

@Injectable()
export class ValidateProductAvailabilityHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ productId }: IValidateProductAvailabilityHandlerDto) {
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

    if (!!existingOrder) {
      throw new BadRequestException('Product is unavailable at the moment')
    }
  }
}
