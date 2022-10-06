import { Stan } from 'node-nats-streaming'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { DatabaseModule } from '../database/database.module'
import { CreateProductHandler, UpdateProductHandler } from '../handlers'
import { TicketCreatedListener, TicketUpdatedListener } from './listeners'
import { OrderCancelledPublisher, OrderCreatedPublisher } from './publishers'

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [
    {
      inject: [ConfigService],
      provide: 'NATS_STREAMING_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const nats = await import('node-nats-streaming')
        const natsClusterId = config.get<string>('NATS_CLUSTER_ID')
        const natsClientId = config.get<string>('NATS_CLIENT_ID')
        const natsUrl = config.get<string>('NATS_URL')

        return new Promise<Stan>((resolve, reject) => {
          const stan = nats.connect(natsClusterId, natsClientId, {
            url: natsUrl,
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
    TicketCreatedListener,
    TicketUpdatedListener,
    CreateProductHandler,
    UpdateProductHandler,
    OrderCreatedPublisher,
    OrderCancelledPublisher,
  ],
  exports: [
    TicketCreatedListener,
    TicketUpdatedListener,
    OrderCreatedPublisher,
    OrderCancelledPublisher,
  ],
})
export class EventsModule {}
