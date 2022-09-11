import { differenceInSeconds } from 'date-fns'
import * as request from 'supertest'

import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ORDER_STATUS, User } from '@rntlombatickets/common'

import { PrismaService } from '../src/database/prisma/prisma.service'
import { CreatePendingOrderHandler } from '../src/handlers/create-pending-order.handler'
import { authToken } from './utils/auth-token'
import { createNestApp } from './utils/create-nest-app'
import { CreateProductDatabaseStub } from './utils/stubs/create-product-database.stub'

describe('Create Order (e2e)', () => {
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
    let currentUser: User
    let accessToken: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { access_token, user } = authToken(config)
      currentUser = user
      accessToken = access_token
    })

    it('should return a status code 401 when user is not logged', async () => {
      return request(app.getHttpServer()).post('/api/orders/create').expect(401)
    })

    it('should return a status code 400 when externalId is not on the request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'externalId should not be empty',
        'externalId must be a string',
      ])
    })

    it('should return a status code 400 when externalId is not a string', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          externalId: 123,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['externalId must be a string'])
    })

    it('should return a status code 400 when trying to create an order for a product that has not yet been created', async () => {
      const externalId = faker.datatype.uuid()

      const response = await request(app.getHttpServer())
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          externalId,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(
        'Trying to create order with a inexistent product',
      )
    })

    it('should return a status code 400 when trying to create an order for a product that has been already reserved', async () => {
      const productData = CreateProductDatabaseStub()
      const externalId = productData.externalId

      await prisma.product.create({
        data: productData,
      })

      await createOrder.execute({
        externalId,
        userId: faker.datatype.uuid(),
      })

      const response = await request(app.getHttpServer())
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          externalId,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual('Product is already reserved')
    })

    it('should return a create order data when successfully handled request', async () => {
      const productData = CreateProductDatabaseStub()
      const externalId = productData.externalId

      await prisma.product.create({
        data: productData,
      })

      const response = await request(app.getHttpServer())
        .post('/api/orders/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          externalId,
        })

      expect(response.statusCode).toEqual(201)
      expect(response.body.productId).toEqual(productData.id)
      expect(response.body.status).toEqual(ORDER_STATUS.CREATED)
      expect(response.body.userId).toEqual(currentUser.id)
      expect(
        differenceInSeconds(new Date(response.body.expiresAt), new Date()),
      ).toEqual(createOrder.EXPIRATION_WINDOW_SECONDS - 1)
    })

    it.todo('should publish the order created event')
  })
})
