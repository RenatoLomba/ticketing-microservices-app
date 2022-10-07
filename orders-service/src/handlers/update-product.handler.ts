import { BadRequestException, Injectable } from '@nestjs/common'

import { ProductsRepository } from '../database/repositories'
import { compareVersions } from '../events/listeners'

interface IUpdateProductHandlerDto {
  externalId: string
  title: string
  price: number
  version: number
}

@Injectable()
export class UpdateProductHandler {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    externalId,
    price,
    title,
    version,
  }: IUpdateProductHandlerDto) {
    const product = await this.productsRepository.getByExternalId(externalId)

    if (!product) {
      throw new BadRequestException('Product does not exists')
    }

    const newVersion = version
    const oldVersion = product.version

    if (newVersion === oldVersion) {
      throw new Error(`Versions are the same, so can't update`)
    }

    if (newVersion - 1 !== oldVersion) {
      throw new Error('Versions are not compatible')
    }

    await this.productsRepository.update(product.id, {
      price,
      title,
    })
  }
}
