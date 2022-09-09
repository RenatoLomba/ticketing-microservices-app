import { BadRequestException, Injectable } from '@nestjs/common'

import { ProductsRepository } from '../database/repositories/products.repository'

interface ICreateProductHandlerDto {
  externalId: string
  title: string
  price: number
}

@Injectable()
export class CreateProductHandler {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({ externalId, price, title }: ICreateProductHandlerDto) {
    const productAlreadyExists = await this.productsRepository.getByExternalId(
      externalId,
    )

    if (!!productAlreadyExists) {
      throw new BadRequestException('Product with externalId already exists')
    }

    await this.productsRepository.create({
      price,
      title,
      externalId,
    })
  }
}
