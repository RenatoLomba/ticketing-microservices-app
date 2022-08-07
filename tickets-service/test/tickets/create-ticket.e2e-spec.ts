import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@rntlombatickets/common'

import { authTokenMock } from '../utils/auth-token.mock'
import { createNestApp } from '../utils/create-nest-app'

describe('TicketsController (e2e)', () => {
  let app: INestApplication
  let configService: ConfigService

  beforeEach(async () => {
    app = await createNestApp()

    configService = app.get<ConfigService>(ConfigService)

    await app.init()
  })

  describe('createTicket', () => {
    let currentUser: User
    let accessToken: string

    beforeEach(() => {
      const { access_token, user } = authTokenMock(configService)
      currentUser = user
      accessToken = access_token
    })

    it('should return status code 401 when user is not authenticated', async () => {
      return request(app.getHttpServer())
        .post('/api/tickets/create')
        .expect(401)
    })

    it('should return status code 400 when body is not provided', async () => {
      return request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
    })

    it('should return status code 400 when title is undefined', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: 19.99,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'title should not be empty',
        'title must be a string',
      ])
    })

    it('should return status code 400 when title is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '',
          price: 19.99,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['title should not be empty'])
    })

    it('should return status code 400 when price is undefined', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a positive number',
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 when price is not a number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: '24.56',
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a positive number',
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 when price is negative', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: -25,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['price must be a positive number'])
    })

    it('should return status code 400 when price is 0', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 0,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(['price must be a positive number'])
    })

    it('should return status code 400 when price is NaN', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: NaN,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a positive number',
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 when price has more than 2 floating numbers', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 23.456,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual([
        'price must be a number conforming to the specified constraints',
      ])
    })

    it('should return status code 400 trying to create a token with title/slug that already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 23.45,
        })

      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 23.45,
        })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(
        'Ticket with title/slug already exists',
      )
    })

    it('should return status code 201 when successfully created a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 29.99,
        })

      expect(response.statusCode).toEqual(201)
      expect(response.body).toHaveProperty('slug')
      expect(response.body.userId).toEqual(currentUser.id)
    })
  })
})
