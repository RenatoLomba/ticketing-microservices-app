import { faker } from '@faker-js/faker'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { authToken } from '../../test/utils/auth-token'
import { createNestApp } from '../../test/utils/create-nest-app'
import { CreateOrderDatabaseStub } from '../../test/utils/stubs/create-order-database.stub'
import { CreateProductDatabaseStub } from '../../test/utils/stubs/create-product-database.stub'
import { PrismaService } from '../database/prisma/prisma.service'
import { OrdersRepository } from '../database/repositories/orders.repository'
import { CancelOrderHandler } from '../handlers/cancel-order.handler'
import { GetOrderDetailsHandler } from '../handlers/get-order-details.handler'

describe('CancelOrderHandler', () => {
  let handler: CancelOrderHandler
  let getOrderDetails: GetOrderDetailsHandler
  let prisma: PrismaService
  let config: ConfigService
  let ordersRepository: OrdersRepository

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(CancelOrderHandler)
    prisma = app.get(PrismaService)
    config = app.get(ConfigService)
    ordersRepository = app.get(OrdersRepository)
    getOrderDetails = app.get(GetOrderDetailsHandler)

    await app.init()
  })

  describe('execute', () => {
    let currentUserId: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { user } = authToken(config)
      currentUserId = user.id
    })

    it('throws error when trying to cancel an inexistent order', async () => {
      const orderId = faker.datatype.uuid()

      await expect(
        handler.execute({ orderId, userId: currentUserId }),
      ).rejects.toThrowError(
        new BadRequestException('Trying to cancel an inexistent order'),
      )
    })

    it('throws error when trying to cancel an order that is reserved by other user', async () => {
      const product = CreateProductDatabaseStub()

      await prisma.product.create({ data: product })

      const order = CreateOrderDatabaseStub({
        userId: faker.datatype.uuid(),
        productId: product.id,
      })

      await prisma.order.create({ data: order })

      await expect(
        handler.execute({ orderId: order.id, userId: currentUserId }),
      ).rejects.toThrowError(
        new ForbiddenException('User cannot cancel this order'),
      )
    })

    it('should set the status of a given order to cancelled', async () => {
      const productData = CreateProductDatabaseStub()
      await prisma.product.create({ data: productData })

      const orderData = CreateOrderDatabaseStub({
        userId: currentUserId,
        productId: productData.id,
      })
      await prisma.order.create({ data: orderData })

      const order = await getOrderDetails.execute({
        userId: currentUserId,
        orderId: orderData.id,
      })

      expect(order.status).toEqual(ORDER_STATUS.CREATED)

      const updateOrderSpy = jest.spyOn(ordersRepository, 'update')

      await handler.execute({ orderId: order.id, userId: currentUserId })

      const orderUpdated = await getOrderDetails.execute({
        userId: currentUserId,
        orderId: order.id,
      })

      expect(updateOrderSpy).toHaveBeenCalledWith(order.id, {
        status: ORDER_STATUS.CANCELLED,
      })
      expect(orderUpdated.status).toEqual(ORDER_STATUS.CANCELLED)
    })
  })
})
