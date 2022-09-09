import { differenceInSeconds } from 'date-fns'

import { faker } from '@faker-js/faker'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { authToken } from '../../../test/utils/auth-token'
import { createNestApp } from '../../../test/utils/create-nest-app'
import { PrismaService } from '../../database/prisma/prisma.service'
import { CreatePendingOrderHandler } from '../create-pending-order.handler'

describe('CreatePendingOrderHandler', () => {
  let handler: CreatePendingOrderHandler
  let prisma: PrismaService
  let config: ConfigService

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(CreatePendingOrderHandler)
    prisma = app.get(PrismaService)
    config = app.get(ConfigService)

    await app.init()
  })

  describe('execute', () => {
    let userId: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { user } = authToken(config)
      userId = user.id
    })

    it('throws an error when trying to order a product that does not exists', async () => {
      const externalId = faker.datatype.uuid()

      await expect(
        handler.execute({ externalId, userId }),
      ).rejects.toThrowError(
        new BadRequestException(
          'Trying to create order with a inexistent product',
        ),
      )
    })

    it('throws an error when trying to order a product that is already reserved', async () => {
      const productId = faker.datatype.uuid()
      const externalId = faker.datatype.uuid()

      await prisma.product.create({
        data: {
          externalId,
          id: productId,
          price: 20.5,
          title: 'Ticket 1',
        },
      })

      await prisma.order.create({
        data: {
          userId,
          productId,
          status: ORDER_STATUS.CREATED,
        },
      })

      await expect(
        handler.execute({ externalId, userId }),
      ).rejects.toThrowError(
        new BadRequestException('Product is already reserved'),
      )
    })

    it('returns a created order with status created and expiration date of 15 minutes', async () => {
      const externalId = faker.datatype.uuid()
      const productId = faker.datatype.uuid()

      await prisma.product.create({
        data: {
          externalId,
          id: productId,
          price: 20.5,
          title: 'Ticket 1',
        },
      })

      const result = await handler.execute({ externalId, userId })

      expect(result).toBeTruthy()
      expect(result.productId).toEqual(productId)
      expect(result.status).toEqual(ORDER_STATUS.CREATED)
      expect(result.userId).toEqual(userId)
      expect(differenceInSeconds(result.expiresAt, new Date())).toEqual(
        handler.EXPIRATION_WINDOW_SECONDS - 1,
      )
    })
  })
})
