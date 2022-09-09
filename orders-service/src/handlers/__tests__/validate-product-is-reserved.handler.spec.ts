import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { authToken } from '../../../test/utils/auth-token'
import { createNestApp } from '../../../test/utils/create-nest-app'
import { PrismaService } from '../../database/prisma/prisma.service'
import { ValidateProductIsReservedHandler } from '../validate-product-is-reserved.handler'

describe('ValidateProductIsReservedHandler', () => {
  let handler: ValidateProductIsReservedHandler
  let prisma: PrismaService
  let config: ConfigService

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(ValidateProductIsReservedHandler)
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

    it('should return false when product does not exists in any order', async () => {
      const productId = faker.datatype.uuid()

      expect(await handler.execute({ productId })).toEqual(false)
    })

    it('should return false when there is an order for the product but it is cancelled', async () => {
      const productId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId,
          userId,
          status: ORDER_STATUS.CANCELLED,
        },
      })

      expect(await handler.execute({ productId })).toEqual(false)
    })

    it('should return true when there is an order for the product that is created', async () => {
      const productId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId,
          userId,
          status: ORDER_STATUS.CREATED,
        },
      })

      expect(await handler.execute({ productId })).toEqual(true)
    })

    it('should return true when there is an order for the product that is awaiting payment', async () => {
      const productId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId,
          userId,
          status: ORDER_STATUS.AWAITING_PAYMENT,
        },
      })

      expect(await handler.execute({ productId })).toEqual(true)
    })

    it('should return true when there is an order for the product that is complete', async () => {
      const productId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId,
          userId,
          status: ORDER_STATUS.COMPLETE,
        },
      })

      expect(await handler.execute({ productId })).toEqual(true)
    })
  })
})
