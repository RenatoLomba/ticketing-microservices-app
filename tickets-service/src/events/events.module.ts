import { Stan } from 'node-nats-streaming'

import { Module } from '@nestjs/common'

import { TicketCreatedPublisher } from './publishers/ticket-created.publisher'

@Module({
  providers: [
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
  exports: [TicketCreatedPublisher],
})
export class EventsModule {}
