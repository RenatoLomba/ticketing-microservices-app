import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { authTokenMock } from '../__mocks__/auth-token.mock'
import { createNestAppMock } from '../__mocks__/create-nest-app.mock'

describe('TicketsController (e2e)', () => {
  let app: INestApplication
  let configService: ConfigService

  beforeEach(async () => {
    app = await createNestAppMock()

    configService = app.get<ConfigService>(ConfigService)

    await app.init()
  })

  describe('listTickets', () => {
    let accessToken: string

    beforeEach(() => {
      const { access_token } = authTokenMock(configService)
      accessToken = access_token
    })

    it('should return status code 200 when successfully retrieved tickets', async () => {
      return request(app.getHttpServer()).get('/api/tickets/list').expect(200)
    })

    it('should return empty array on body when any token has been created', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/tickets/list',
      )

      expect(response.body).toEqual([])
    })

    it('should return array count 1 on body when 1 token has been created', async () => {
      let response = await request(app.getHttpServer()).get('/api/tickets/list')

      expect(response.body).toEqual([])

      await request(app.getHttpServer())
        .post('/api/tickets/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Valid Ticket Title',
          price: 29.99,
        })
        .expect(201)

      response = await request(app.getHttpServer()).get('/api/tickets/list')

      expect(response.body.length).toEqual(1)
    })
  })
})
