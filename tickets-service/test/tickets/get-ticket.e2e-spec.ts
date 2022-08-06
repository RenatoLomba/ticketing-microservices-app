import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

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
    let accessToken: string

    beforeEach(() => {
      const { access_token } = authTokenMock(configService)
      accessToken = access_token
    })

    it('should return status code 404 when trying to get ticket not passing the slug param', async () => {
      return request(app.getHttpServer()).get('/api/tickets/').expect(404)
    })

    it('should return status code 401 when trying to get ticket with non existent slug', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/tickets/invalid-slug',
      )

      expect(response.statusCode).toEqual(400)
      expect(response.body.message).toEqual(`Ticket requested don't exist`)
    })

    it('should return status code 200 when successfully retrieved a ticket by slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 29.99,
        })

      const slug = response.body.slug

      return request(app.getHttpServer())
        .get(`/api/tickets/${slug}`)
        .expect(200)
    })
  })
})
