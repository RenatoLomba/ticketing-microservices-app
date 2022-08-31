import { Stan } from 'node-nats-streaming'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

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

  await app.listen(5001, () => {
    console.log('[App]', `Running on port 5001`)
  })
}
bootstrap()
