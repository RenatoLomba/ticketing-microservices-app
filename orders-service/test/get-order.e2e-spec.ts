import * as request from 'supertest'

import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { PrismaService } from '../src/database/prisma/prisma.service'
import { authToken } from './utils/auth-token'
import { createNestApp } from './utils/create-nest-app'
import { CreateProductDatabaseStub } from './utils/stubs/create-product-database.stub'

describe('Get Order (e2e)', () => {
  let app: INestApplication
  let config: ConfigService
  let prisma: PrismaService

  beforeEach(async () => {
    app = await createNestApp()

    config = app.get(ConfigService)
    prisma = app.get(PrismaService)

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

    it('should return a status code 404 when orderId is not passed by param', async () => {
      return request(app.getHttpServer()).get('/api/orders/').expect(404)
    })

    it('should return a status code 401 when user is not logged', async () => {
      const orderId = faker.datatype.uuid()

      return request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .expect(401)
    })

    it('should return a status code 400 when the order user requested does not exists', async () => {
      const orderId = faker.datatype.uuid()

      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual('Order request does not exists')
    })

    it('should return a status code 403 when user is not the owner of the order it requested', async () => {
      const product = CreateProductDatabaseStub()

      await prisma.product.create({
        data: product,
      })

      const orderId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId: product.id,
          status: ORDER_STATUS.CREATED,
          userId: faker.datatype.uuid(),
          id: orderId,
        },
      })

      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(403)
      expect(response.body.message).toEqual(
        'The order requested cannot be accessed by this user',
      )
    })

    it('should return a status code 200 and the order data that user requested on the body', async () => {
      const product = CreateProductDatabaseStub()

      await prisma.product.create({
        data: product,
      })

      const orderId = faker.datatype.uuid()

      await prisma.order.create({
        data: {
          productId: product.id,
          status: ORDER_STATUS.CREATED,
          userId,
          id: orderId,
        },
      })

      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(200)
      expect(response.body.id).toEqual(orderId)
      expect(response.body.status).toEqual(ORDER_STATUS.CREATED)
      expect(response.body.productId).toEqual(product.id)
      expect(response.body.product.title).toEqual(product.title)
      expect(response.body.product.version).toEqual(1)
    })
  })
})
