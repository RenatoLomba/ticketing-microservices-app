import { addMinutes } from 'date-fns'

import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'

interface ICreatePendingOrderHandlerDto {
  productId: string
  userId: string
}

@Injectable()
export class CreatePendingOrderHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ productId, userId }: ICreatePendingOrderHandlerDto) {
    return this.prisma.order
      .create({
        data: {
          productId,
          userId,
          status: 'PENDING',
          expiresAt: addMinutes(new Date(), 15),
        },
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
