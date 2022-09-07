import { Stan } from 'node-nats-streaming'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { TicketCreatedListener } from './events/listeners/ticket-created.listener'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  const stan = app.get<Stan>('NATS_STREAMING_CONNECTION')

  stan.on('close', () => {
    console.log('[NATS]', 'Closed')
    process.exit()
  })

  process.on('SIGINT', () => stan.close())
  process.on('SIGTERM', () => stan.close())

  const ticketCreatedListener = app.get<TicketCreatedListener>(
    TicketCreatedListener,
  )

  ticketCreatedListener.listen()

  await app.listen(5002, () => {
    console.log('[App]', `Running on port 5002`)
  })
}
bootstrap()
