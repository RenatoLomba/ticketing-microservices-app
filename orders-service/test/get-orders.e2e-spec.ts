import * as request from 'supertest'

import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from '../src/database/prisma/prisma.service'
import { CreatePendingOrderHandler } from '../src/handlers/create-pending-order.handler'
import { authToken } from './utils/auth-token'
import { createNestApp } from './utils/create-nest-app'
import { CreateProductDatabaseStub } from './utils/stubs/create-product-database.stub'

describe('Get Orders (e2e)', () => {
  let app: INestApplication
  let config: ConfigService
  let prisma: PrismaService
  let createOrder: CreatePendingOrderHandler

  beforeEach(async () => {
    app = await createNestApp()

    config = app.get(ConfigService)
    prisma = app.get(PrismaService)
    createOrder = app.get(CreatePendingOrderHandler)

    await app.init()
  })

  describe('route', () => {
    let accessToken: string
    let userId: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { access_token, user } = authToken(config)
      accessToken = access_token
      userId = user.id
    })

    it('should return a status code 401 when user is not logged', async () => {
      return request(app.getHttpServer())
        .get('/api/orders/list/all')
        .expect(401)
    })

    it('should return a status code 200 and an empty array on body when user has no orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/list/all')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(200)
      expect(response.body).toEqual([])
    })

    it('should return a status code 200 and an array with all the orders made by the user', async () => {
      const product1 = CreateProductDatabaseStub()
      const product2 = CreateProductDatabaseStub()

      await prisma.product.create({
        data: product1,
      })
      await prisma.product.create({
        data: product2,
      })

      const fakeUserId = faker.datatype.uuid()

      await createOrder.execute({
        userId,
        externalId: product1.externalId,
      })
      await createOrder.execute({
        userId: fakeUserId,
        externalId: product2.externalId,
      })

      const response = await request(app.getHttpServer())
        .get('/api/orders/list/all')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(200)
      expect(response.body.length).toEqual(1)
    })
  })
})
