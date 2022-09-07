import { BadRequestException, Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IValidateProductAvailabilityHandlerDto {
  productId: string
}

@Injectable()
export class ValidateProductAvailabilityHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ productId }: IValidateProductAvailabilityHandlerDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        productId,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    })

    if (!!order) {
      throw new BadRequestException('Product is unavailable at the moment')
    }
  }
}
