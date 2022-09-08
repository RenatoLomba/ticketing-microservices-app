import { addMinutes } from 'date-fns'

import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../database/prisma/prisma.service'
import { GetProductByExternal } from './get-product-by-external.handler'
import { ValidateProductIsReservedHandler } from './validate-product-is-reserved.handler'

interface ICreatePendingOrderHandlerDto {
  externalId: string
  userId: string
}

@Injectable()
export class CreatePendingOrderHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getProductByExternal: GetProductByExternal,
    private readonly validateProductIsReserved: ValidateProductIsReservedHandler,
  ) {}

  async execute({ externalId, userId }: ICreatePendingOrderHandlerDto) {
    const product = await this.getProductByExternal.execute({ externalId })

    const productId = product.id

    const productIsReserved = await this.validateProductIsReserved.execute({
      productId,
    })

    if (productIsReserved) {
      throw new BadRequestException('Product is already reserved')
    }

    // Publish an event saying that an order was created

    return this.prisma.order
      .create({
        data: {
          productId,
          userId,
          status: ORDER_STATUS.CREATED,
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
