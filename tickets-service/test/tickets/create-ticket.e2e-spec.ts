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

    it('should return status code 400 when title is not provided or empty', async () => {
      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: 19.99,
        })
        .expect(400)

      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '',
          price: 19.99,
        })
        .expect(400)
    })

    it('should return status code 400 when price is not provided or invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: -25,
        })
        .expect(400)

      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 0,
        })
        .expect(400)

      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: NaN,
        })
        .expect(400)

      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 25.987,
        })
        .expect(400)
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
