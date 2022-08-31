import { Stan } from 'node-nats-streaming'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created.publisher'
import { TicketsService } from '../services/tickets.service'
import { TicketsController } from './routes/tickets.controller'

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [TicketsController],
  providers: [
    JwtStrategy,
    TicketsService,
    {
      provide: 'NATS_STREAMING_CONNECTION',
      useFactory: async () => {
        const nats = await import('node-nats-streaming')

        const stan = nats.connect('ticketing', 'tickets-service-publisher', {
          url: 'http://nats-srv:4222',
        })

        return new Promise<Stan>((resolve, reject) => {
          stan.on('error', (err) => {
            reject(err)
          })

          stan.on('connect', () => {
            console.log('Tickets Service Publisher connected to NATS...')

            resolve(stan)
          })
        })
      },
    },
    TicketCreatedPublisher,
  ],
})
export class HttpModule {}
