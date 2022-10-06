import { BadRequestException, Injectable } from '@nestjs/common'

import { ProductsRepository } from '../database/repositories'

interface IUpdateProductHandlerDto {
  externalId: string
  title: string
  price: number
}

@Injectable()
export class UpdateProductHandler {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({ externalId, price, title }: IUpdateProductHandlerDto) {
    const product = await this.productsRepository.getByExternalId(externalId)

    if (!product) {
      throw new BadRequestException('Product does not exists')
    }

    await this.productsRepository.update(product.id, {
      price,
      title,
    })
  }
}
