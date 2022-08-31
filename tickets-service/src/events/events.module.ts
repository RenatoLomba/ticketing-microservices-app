import { Stan } from 'node-nats-streaming'

import { Module } from '@nestjs/common'

import { TicketCreatedPublisher } from './publishers/ticket-created.publisher'

@Module({
  providers: [
    {
      provide: 'NATS_STREAMING_CONNECTION',
      useFactory: async () => {
        const nats = await import('node-nats-streaming')

        return new Promise<Stan>((resolve, reject) => {
          const stan = nats.connect('ticketing', 'tickets-service-publisher', {
            url: 'http://nats-srv:4222',
          })

          stan.on('error', (err) => {
            reject(err)
          })

          stan.on('connect', () => {
            console.log('[NATS]', 'Connect')

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
