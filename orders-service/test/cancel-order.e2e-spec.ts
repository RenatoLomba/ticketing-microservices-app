import * as request from 'supertest'

import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../src/database/prisma/prisma.service'
import { OrdersRepository } from '../src/database/repositories/orders.repository'
import { authToken } from './utils/auth-token'
import { createNestApp } from './utils/create-nest-app'
import { CreateOrderDatabaseStub } from './utils/stubs/create-order-database.stub'
import { CreateProductDatabaseStub } from './utils/stubs/create-product-database.stub'

describe('Cancel Order (e2e)', () => {
  let app: INestApplication
  let config: ConfigService
  let prisma: PrismaService
  let ordersRepository: OrdersRepository

  beforeEach(async () => {
    app = await createNestApp()

    config = app.get(ConfigService)
    prisma = app.get(PrismaService)
    ordersRepository = app.get(OrdersRepository)

    await app.init()
  })

  describe('route', () => {
    let currentUserId: string
    let accessToken: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { access_token, user } = authToken(config)

      currentUserId = user.id
      accessToken = access_token
    })

    it('should return a status code 404 when orderId is not passed by param', async () => {
      return request(app.getHttpServer())
        .patch('/api/orders//cancel')
        .expect(404)
    })

    it('should return a status code 401 when user is not logged', async () => {
      const orderId = faker.datatype.uuid()

      return request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/cancel`)
        .expect(401)
    })

    it('should return a status code 400 when the order user requested to cancel does not exists', async () => {
      const orderId = faker.datatype.uuid()

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(
        'Trying to cancel an inexistent order',
      )
    })

    it('should return a status code 403 when user is not the owner of the order it requested to cancel', async () => {
      const product = CreateProductDatabaseStub()

      await prisma.product.create({ data: product })

      const order = CreateOrderDatabaseStub({
        productId: product.id,
        userId: faker.datatype.uuid(),
      })

      await prisma.order.create({ data: order })

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(403)
      expect(response.body.message).toEqual('User cannot cancel this order')
    })

    it('should return a status code 204 when successfully cancelled the order', async () => {
      const product = await prisma.product.create({
        data: CreateProductDatabaseStub(),
      })

      const { id: orderId } = await prisma.order.create({
        data: CreateOrderDatabaseStub({
          productId: product.id,
          userId: currentUserId,
        }),
      })

      const order = await ordersRepository.getOrderById(orderId)

      expect(order.status).toEqual(ORDER_STATUS.CREATED)

      await request(app.getHttpServer())
        .patch(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)

      const orderUpdated = await ordersRepository.getOrderById(orderId)

      expect(orderUpdated.status).toEqual(ORDER_STATUS.CANCELLED)
    })

    it.todo('should publish the order updated')
  })
})
