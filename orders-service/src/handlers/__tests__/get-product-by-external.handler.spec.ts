import { faker } from '@faker-js/faker'
import { BadRequestException } from '@nestjs/common'

import { createNestApp } from '../../../test/utils/create-nest-app'
import { PrismaService } from '../../database/prisma/prisma.service'
import { GetProductByExternal } from '../get-product-by-external.handler'

describe('GetProductByExternalHandler', () => {
  let handler: GetProductByExternal
  let prisma: PrismaService

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(GetProductByExternal)
    prisma = app.get(PrismaService)

    await app.init()
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('throws an error when trying to get a product that does not exists', async () => {
      const externalId = faker.datatype.uuid()

      await expect(handler.execute({ externalId })).rejects.toThrowError(
        new BadRequestException('Requested product does not exists'),
      )
    })

    it('return a existing product with the given externalId passed as param', async () => {
      const externalId = faker.datatype.uuid()

      await prisma.product.create({
        data: {
          externalId,
          title: 'Ticket 1',
          price: 20.5,
        },
      })

      const result = await handler.execute({ externalId })

      expect(result).toBeTruthy()
      expect(result.externalId).toEqual(externalId)
    })
  })
})
