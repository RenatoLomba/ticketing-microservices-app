import createPrismaMock from 'prisma-mock'

import { ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/database/prisma/prisma.service'

export const createNestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(await createPrismaMock<PrismaService>())
    .compile()

  const app = moduleFixture.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  return app
}
