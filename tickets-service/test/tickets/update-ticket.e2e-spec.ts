import { Stan } from 'node-nats-streaming'
import * as request from 'supertest'

import { faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@rntlombatickets/common'

import { authTokenMock } from '../__mocks__/auth-token.mock'
import { createNestAppMock } from '../__mocks__/create-nest-app.mock'
import { PrismaService } from '../../src/database/prisma/prisma.service'

describe('TicketsController (e2e)', () => {
  let app: INestApplication
  let configService: ConfigService
  let prisma: PrismaService
  let natsClient: Stan

  beforeEach(async () => {
    app = await createNestAppMock()

    configService = app.get<ConfigService>(ConfigService)
    prisma = app.get<PrismaService>(PrismaService)
    natsClient = app.get<Stan>('NATS_STREAMING_CONNECTION')

    await app.init()
  })

  describe('updateTicket', () => {
    let currentUser: User
    let accessToken: string

    beforeEach(() => {
      jest.clearAllMocks()

      const { access_token, user } = authTokenMock(configService)
      currentUser = user
      accessToken = access_token
    })

    it('should return status code 404 when not passing ticket slug on param', async () => {
      return request(app.getHttpServer())
        .put('/api/tickets/update/')
        .expect(404)
    })

    it('should return status code 401 when user is not authenticated', async () => {
      return request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .expect(401)
    })

    it('should return status code 400 when title is empty', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '',
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['title should not be empty'])
    })

    it('should return status code 400 when price is not a number', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: '23.45',
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a positive number',
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 when price is negative', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: -25,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['price must be a positive number'])
    })

    it('should return status code 400 when price is 0', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: 0,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['price must be a positive number'])
    })

    it('should return status code 400 when price has more than 2 floating numbers', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: 23.456,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 when ticket does not exist', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/tickets/update/valid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 23.45,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual('Ticket does not exist')
    })

    it('should return status code 401 when trying to update other user ticket', async () => {
      const ticket = await prisma.ticket.create({
        data: {
          id: faker.datatype.uuid(),
          title: 'Valid Ticket Title',
          price: 12.34,
          slug: 'valid-ticket-title',
          userId: currentUser.id,
          createdAt: new Date(),
        },
      })

      const { access_token: unauthorizedAccessToken } =
        authTokenMock(configService)

      const response = await request(app.getHttpServer())
        .put(`/api/tickets/update/${ticket.id}`)
        .set('Authorization', `Bearer ${unauthorizedAccessToken}`)
        .send({
          title: 'Valid Ticket Title UPDATED',
          price: 45.67,
        })

      expect(response.statusCode).toEqual(401)
      expect(response.body.message).toEqual('You cannot update this ticket')
    })

    it('should return status code 400 trying to update a token with a title/slug that already exists', async () => {
      const ticket = await prisma.ticket.create({
        data: {
          id: faker.datatype.uuid(),
          title: 'Valid Ticket Title',
          price: 12.34,
          slug: 'valid-ticket-title',
          userId: currentUser.id,
          createdAt: new Date(),
        },
      })

      await prisma.ticket.create({
        data: {
          id: faker.datatype.uuid(),
          title: 'Valid Ticket Title 2',
          price: 12.34,
          slug: 'valid-ticket-title-2',
          userId: currentUser.id,
          createdAt: new Date(),
        },
      })

      const response = await request(app.getHttpServer())
        .put(`/api/tickets/update/${ticket.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title 2',
          price: 45.67,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(
        'Ticket with title/slug already exists',
      )
    })

    it('should return status code 200 when successfully updated the ticket', async () => {
      const ticket = await prisma.ticket.create({
        data: {
          id: faker.datatype.uuid(),
          title: 'Valid Ticket Title',
          price: 12.34,
          slug: 'valid-ticket-title',
          userId: currentUser.id,
          createdAt: new Date(),
        },
      })

      const updateDto = {
        title: 'Valid Ticket Title UPDATED',
        price: 45.67,
      }

      const response = await request(app.getHttpServer())
        .put(`/api/tickets/update/${ticket.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)

      expect(response.statusCode).toEqual(200)
      expect(response.body.title).toEqual(updateDto.title)
      expect(response.body.price).toEqual(updateDto.price)
      expect(response.body.slug).toEqual('valid-ticket-title-updated')
    })

    it('should publish the ticket updated event with data about the ticket', async () => {
      const ticket = await prisma.ticket.create({
        data: {
          id: faker.datatype.uuid(),
          title: 'Valid Ticket Title',
          price: 12.34,
          slug: 'valid-ticket-title',
          userId: currentUser.id,
          createdAt: new Date(),
        },
      })

      const updateDto = {
        title: 'Valid Ticket Title UPDATED',
        price: 45.67,
      }

      await request(app.getHttpServer())
        .put(`/api/tickets/update/${ticket.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)

      expect(natsClient.publish).toHaveBeenCalled()
    })
  })
})
