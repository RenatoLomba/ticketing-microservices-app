import { faker } from '@faker-js/faker'
import { BadRequestException } from '@nestjs/common'

import { createNestApp } from '../../../test/utils/create-nest-app'
import { GetProductByExternal } from '../get-product-by-external.handler'

describe('GetProductByExternalHandler', () => {
  let handler: GetProductByExternal

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(GetProductByExternal)

    await app.init()
  })

  describe('execute', () => {
    it('throws an error when trying to get a product that does not exists', async () => {
      const externalId = faker.datatype.uuid()

      await expect(handler.execute({ externalId })).rejects.toThrowError(
        new BadRequestException('Requested product does not exists'),
      )
    })
  })
})
