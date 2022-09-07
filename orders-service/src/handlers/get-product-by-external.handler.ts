import { BadRequestException, Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma/prisma.service'

interface IGetProductByExternalDto {
  externalId: string
}

@Injectable()
export class GetProductByExternal {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ externalId }: IGetProductByExternalDto) {
    const product = await this.prisma.product.findUnique({
      where: { externalId },
      select: {
        id: true,
        title: true,
        price: true,
        version: true,
        externalId: true,
        createdAt: true,
      },
    })

    if (!product) {
      throw new BadRequestException('Requested product does not exists')
    }

    return product
  }
}
