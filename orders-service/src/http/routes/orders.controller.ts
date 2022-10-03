import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import {
  OrderCancelledPublisher,
  OrderCreatedPublisher,
} from '../../events/publishers'
import {
  CancelOrderHandler,
  CreatePendingOrderHandler,
  GetOrderDetailsHandler,
  GetUserOrdersHandler,
} from '../../handlers'
import { CreateOrderDto } from '../dtos'

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly createPendingOrder: CreatePendingOrderHandler,
    private readonly getUserOrders: GetUserOrdersHandler,
    private readonly getOrderDetails: GetOrderDetailsHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
    private readonly orderCreatedPublisher: OrderCreatedPublisher,
    private readonly orderCancelledPublisher: OrderCancelledPublisher,
  ) {}

  @Get('/healthcheck')
  @HttpCode(200)
  healthcheck() {
    return 'Server is health!'
  }

  @Get('/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.getOrderDetails.execute({ orderId: id, userId: user.id })
  }

  @Get('/list/all')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getOrders(@CurrentUser() user: User) {
    return this.getUserOrders.execute({ userId: user.id })
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() { externalId }: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    const order = await this.createPendingOrder.execute({
      externalId,
      userId: user.id,
    })

    this.orderCreatedPublisher.publish({
      expiresAt: order.expiresAt.toISOString(),
      id: order.id,
      product: {
        id: order.product.id,
        externalId: order.product.externalId,
        price: order.product.price,
      },
      status: order.status,
      userId: order.userId,
    })

    return order
  }

  @Patch('/:id/cancel')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
    const order = await this.cancelOrderHandler.execute({
      orderId: id,
      userId: user.id,
    })

    this.orderCancelledPublisher.publish({
      id: order.id,
      product: {
        externalId: order.product.externalId,
        id: order.product.id,
      },
    })
  }
}
