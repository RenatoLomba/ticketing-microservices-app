import { addMinutes } from 'date-fns'

import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../database/prisma/prisma.service'
import { GetProductByExternal } from './get-product-by-external.handler'
import { ValidateProductAvailabilityHandler } from './validate-product-availability.handler'

interface ICreatePendingOrderHandlerDto {
  externalId: string
  userId: string
}

@Injectable()
export class CreatePendingOrderHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getProductByExternal: GetProductByExternal,
    private readonly validateProductAvailability: ValidateProductAvailabilityHandler,
  ) {}

  async execute({ externalId, userId }: ICreatePendingOrderHandlerDto) {
    const product = await this.getProductByExternal.execute({ externalId })

    const productId = product.id

    await this.validateProductAvailability.execute({ productId })

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
