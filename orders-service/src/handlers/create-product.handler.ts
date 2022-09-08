import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

interface ICreateProductHandlerDto {
  externalId: string
  title: string
  price: number
}

@Injectable()
export class CreateProductHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ externalId, price, title }: ICreateProductHandlerDto) {
    await this.prisma.product
      .create({
        data: {
          externalId,
          price,
          title,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Duplicate externalId')
          }
        }

        throw error
      })
  }
}
