import { Injectable } from '@nestjs/common'

import { OrdersRepository } from '../database/repositories/orders.repository'

interface IGetUserOrdersHandlerDto {
  userId: string
}

@Injectable()
export class GetUserOrdersHandler {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({ userId }: IGetUserOrdersHandlerDto) {
    const orders = await this.ordersRepository.getOrdersByUserId(userId)

    return orders
  }
}
