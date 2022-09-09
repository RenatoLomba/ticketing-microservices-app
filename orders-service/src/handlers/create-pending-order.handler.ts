import { addSeconds } from 'date-fns'

import { BadRequestException, Injectable } from '@nestjs/common'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { OrdersRepository } from '../database/repositories/orders.repository'
import { ProductsRepository } from '../database/repositories/products.repository'

interface ICreatePendingOrderHandlerDto {
  externalId: string
  userId: string
}

@Injectable()
export class CreatePendingOrderHandler {
  readonly EXPIRATION_WINDOW_SECONDS = 15 * 60

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute({ externalId, userId }: ICreatePendingOrderHandlerDto) {
    const product = await this.productsRepository.getByExternalId(externalId)

    if (!product) {
      throw new BadRequestException(
        'Trying to create order with a inexistent product',
      )
    }

    const productId = product.id

    const productIsReserved =
      await this.ordersRepository.productIsReservedByOrder(productId)

    if (productIsReserved) {
      throw new BadRequestException('Product is already reserved')
    }

    // Publish an event saying that an order was created

    return this.ordersRepository.create({
      productId,
      userId,
      status: ORDER_STATUS.CREATED,
      expiresAt: addSeconds(new Date(), this.EXPIRATION_WINDOW_SECONDS),
    })
  }
}
