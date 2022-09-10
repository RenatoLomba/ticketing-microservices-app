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

import { CancelOrderHandler } from '../../handlers/cancel-order.handler'
import { CreatePendingOrderHandler } from '../../handlers/create-pending-order.handler'
import { GetOrderDetailsHandler } from '../../handlers/get-order-details.handler'
import { GetUserOrdersHandler } from '../../handlers/get-user-orders.handler'
import { CreateOrderDto } from '../dtos/create-order.dto'

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly createPendingOrder: CreatePendingOrderHandler,
    private readonly getUserOrders: GetUserOrdersHandler,
    private readonly getOrderDetails: GetOrderDetailsHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
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
  createOrder(
    @Body() { externalId }: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.createPendingOrder.execute({ externalId, userId: user.id })
  }

  @Patch('/:id/cancel')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.cancelOrderHandler.execute({ orderId: id, userId: user.id })
  }
}
