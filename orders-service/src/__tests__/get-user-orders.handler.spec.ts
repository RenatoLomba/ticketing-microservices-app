import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'

import { authToken } from '../../test/utils/auth-token'
import { createNestApp } from '../../test/utils/create-nest-app'
import { CreateProductDatabaseStub } from '../../test/utils/stubs/create-product-database.stub'
import { PrismaService } from '../database/prisma/prisma.service'
import { CreatePendingOrderHandler } from '../handlers/create-pending-order.handler'
import { GetUserOrdersHandler } from '../handlers/get-user-orders.handler'

describe('GetUserOrdersHandler', () => {
  let handler: GetUserOrdersHandler
  let config: ConfigService

  let createOrder: CreatePendingOrderHandler
  let prisma: PrismaService

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(GetUserOrdersHandler)
    config = app.get(ConfigService)

    createOrder = app.get(CreatePendingOrderHandler)
    prisma = app.get(PrismaService)

    await app.init()
  })

  describe('execute', () => {
    let currentUserId: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { user } = authToken(config)
      currentUserId = user.id
    })

    it('should return an empty array if user does not have any orders', async () => {
      expect(await handler.execute({ userId: currentUserId })).toEqual([])
    })

    it('should return an empty array if user does not have any orders even if other users have', async () => {
      const productData = CreateProductDatabaseStub()
      const { externalId } = productData

      const orderOwnerId = faker.datatype.uuid()

      await prisma.product.create({
        data: productData,
      })

      await createOrder.execute({
        externalId,
        userId: orderOwnerId,
      })

      const ordersCount = (await prisma.order.findMany()).length

      expect(ordersCount).toEqual(1)
      expect(await handler.execute({ userId: currentUserId })).toEqual([])
    })

    it('should return an array with the orders that a user created', async () => {
      const product1 = CreateProductDatabaseStub()
      const product2 = CreateProductDatabaseStub()

      await prisma.product.create({
        data: product1,
      })
      await prisma.product.create({
        data: product2,
      })

      await createOrder.execute({
        externalId: product1.externalId,
        userId: currentUserId,
      })
      await createOrder.execute({
        externalId: product2.externalId,
        userId: currentUserId,
      })

      expect((await handler.execute({ userId: currentUserId })).length).toEqual(
        2,
      )
    })
  })
})
