import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { ORDER_STATUS } from '@rntlombatickets/common'

import { OrdersRepository } from '../database/repositories/orders.repository'

interface ICancelOrderHandlerDto {
  orderId: string
  userId: string
}

@Injectable()
export class CancelOrderHandler {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute({ orderId, userId }: ICancelOrderHandlerDto) {
    const order = await this.ordersRepository.getOrderById(orderId)

    if (!order) {
      throw new BadRequestException('Trying to cancel an inexistent order')
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('User cannot cancel this order')
    }

    await this.ordersRepository.update(orderId, {
      status: ORDER_STATUS.CANCELLED,
    })
  }
}
