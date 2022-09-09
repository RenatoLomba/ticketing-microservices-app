import { faker } from '@faker-js/faker'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS, User } from '@rntlombatickets/common'

import { authToken } from '../../test/utils/auth-token'
import { createNestApp } from '../../test/utils/create-nest-app'
import { PrismaService } from '../database/prisma/prisma.service'
import { GetOrderDetailsHandler } from '../handlers/get-order-details.handler'

describe('GetOrderDetailsHandler', () => {
  let handler: GetOrderDetailsHandler
  let config: ConfigService
  let prisma: PrismaService

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(GetOrderDetailsHandler)
    config = app.get(ConfigService)
    prisma = app.get(PrismaService)

    await app.init()
  })

  describe('execute', () => {
    let currentUser: User

    beforeEach(() => {
      jest.clearAllMocks()

      const { user } = authToken(config)
      currentUser = user
    })

    it('throws an error when trying to retrieve an order that does not exists', async () => {
      const orderId = faker.datatype.uuid()

      await expect(
        handler.execute({ orderId, userId: currentUser.id }),
      ).rejects.toThrowError(
        new BadRequestException('Order request does not exists'),
      )
    })

    it('throws an error when the user trying to retrieve order details is not the owner of the order', async () => {
      const orderId = faker.datatype.uuid()
      const orderOwnerId = faker.datatype.uuid()
      const fakeProductId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          id: orderId,
          userId: orderOwnerId,
          status: ORDER_STATUS.CREATED,
          productId: fakeProductId,
        },
      })

      await expect(
        handler.execute({ orderId, userId: currentUser.id }),
      ).rejects.toThrowError(
        new ForbiddenException(
          'The order requested cannot be accessed by this user',
        ),
      )
    })

    it('should retrieve the details about an order that the user created', async () => {
      const orderId = faker.datatype.uuid()
      const orderOwnerId = currentUser.id
      const fakeProductId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          id: orderId,
          userId: orderOwnerId,
          status: ORDER_STATUS.CREATED,
          productId: fakeProductId,
        },
      })

      const result = await handler.execute({ orderId, userId: currentUser.id })

      expect(result).toBeTruthy()
      expect(result.id).toEqual(orderId)
      expect(result.userId).toEqual(currentUser.id)
    })
  })
})
