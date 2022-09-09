import { faker } from '@faker-js/faker'
import { BadRequestException } from '@nestjs/common'

import { createNestApp } from '../../../test/utils/create-nest-app'
import { ProductsRepository } from '../../database/repositories/products.repository'
import { CreateProductHandler } from '../create-product.handler'

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler
  let productsRepository: ProductsRepository

  beforeEach(async () => {
    const app = await createNestApp()

    handler = app.get(CreateProductHandler)
    productsRepository = app.get(ProductsRepository)

    await app.init()
  })

  describe('execute', () => {
    beforeEach(() => jest.clearAllMocks())

    it('should create an product with the data provided', async () => {
      const externalId = faker.datatype.uuid()
      const title = 'Ticket 1'
      const price = 20.5

      await handler.execute({
        externalId,
        price,
        title,
      })

      const product = await productsRepository.getByExternalId(externalId)

      expect(product).toBeTruthy()
      expect(product.title).toEqual(title)
      expect(product.price).toEqual(price)
      expect(product.version).toEqual(1)
    })

    it('throws an error when trying to create a product with externalId that already exists', async () => {
      const externalId = faker.datatype.uuid()
      const title = 'Ticket 1'
      const price = 20.5

      await productsRepository.create({
        externalId,
        title,
        price,
      })

      await expect(
        handler.execute({ externalId, title, price }),
      ).rejects.toThrowError(
        new BadRequestException('Product with externalId already exists'),
      )
    })
  })
})
