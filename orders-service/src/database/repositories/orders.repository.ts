import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../prisma/prisma.service'

interface ICreateOrderDto {
  productId: string
  userId: string
  status: ORDER_STATUS
  expiresAt: Date
}

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async productIsReservedByOrder(productId: string) {
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

  async getOrderById(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        status: true,
        product: {
          select: {
            id: true,
            title: true,
            externalId: true,
            price: true,
          },
        },
      },
    })
  }

  async getOrdersByUserId(userId: string) {
    return await this.prisma.order.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        status: true,
        product: {
          select: {
            id: true,
            title: true,
            externalId: true,
            price: true,
          },
        },
      },
    })
  }

  async create(data: ICreateOrderDto) {
    return await this.prisma.order
      .create({
        data,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new BadRequestException('Invalid productId')
          }
        }

        throw error
      })
  }
}
