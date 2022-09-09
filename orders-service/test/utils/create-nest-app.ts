import createPrismaMock from 'prisma-mock'

import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma/prisma.service'
import { natsStanMock } from './nats-stan.mock'

export const createNestApp = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(await createPrismaMock<PrismaService>())
    .overrideProvider('NATS_STREAMING_CONNECTION')
    .useValue(natsStanMock())
    .compile()

  const app = moduleFixture.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  return app
}
