import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'

import { authToken } from '../../test/utils/auth-token'
import { createNestApp } from '../../test/utils/create-nest-app'
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
      const externalId = faker.datatype.uuid()
      const orderOwnerId = faker.datatype.uuid()

      await prisma.product.create({
        data: {
          id: faker.datatype.uuid(),
          externalId,
          price: 20.5,
          title: 'Ticket 1',
        },
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
      const externalId = faker.datatype.uuid()
      const externalId2 = faker.datatype.uuid()

      await prisma.product.create({
        data: {
          id: faker.datatype.uuid(),
          externalId,
          price: 20.5,
          title: 'Ticket 1',
        },
      })
      await prisma.product.create({
        data: {
          id: faker.datatype.uuid(),
          externalId: externalId2,
          price: 20.5,
          title: 'Ticket 2',
        },
      })

      await createOrder.execute({
        externalId,
        userId: currentUserId,
      })
      await createOrder.execute({
        externalId: externalId2,
        userId: currentUserId,
      })

      expect((await handler.execute({ userId: currentUserId })).length).toEqual(
        2,
      )
    })
  })
})
