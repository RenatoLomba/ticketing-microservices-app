import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../prisma/prisma.service'

interface ICreateProductDto {
  externalId: string
  title: string
  price: number
}

interface IUpdateProductDto {
  title: string
  price: number
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateProductDto) {
    return await this.prisma.product
      .create({
        data,
        select: {
          id: true,
          price: true,
          title: true,
          externalId: true,
          version: true,
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

  async getByExternalId(externalId: string) {
    return await this.prisma.product.findUnique({
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
  }

  async update(id: string, data: IUpdateProductDto) {
    return await this.prisma.product.update({
      data,
      select: {
        id: true,
        price: true,
        title: true,
        externalId: true,
        version: true,
      },
      where: { id },
    })
  }
}
