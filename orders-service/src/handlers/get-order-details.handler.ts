import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

import { OrdersRepository } from '../database/repositories/orders.repository'

interface IGetOrderDetailsHandlerDto {
  orderId: string
  userId: string
}

@Injectable()
export class GetOrderDetailsHandler {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({ orderId, userId }: IGetOrderDetailsHandlerDto) {
    const order = await this.ordersRepository.getOrderById(orderId)

    if (!order) {
      throw new BadRequestException('Order request does not exists')
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'The order requested cannot be accessed by this user',
      )
    }

    return order
  }
}
