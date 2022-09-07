import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import { CreatePendingOrderHandler } from '../../handlers/create-pending-order.handler'
import { GetOrderDetailsHandler } from '../../handlers/get-order-details.handler'
import { GetUserPendingOrdersHandler } from '../../handlers/get-user-pending-orders.handler'
import { CreateOrderDto } from '../dtos/create-order.dto'

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly createPendingOrder: CreatePendingOrderHandler,
    private readonly getUserPendingOrders: GetUserPendingOrdersHandler,
    private readonly getOrderDetails: GetOrderDetailsHandler,
  ) {}

  @Get('/healthcheck')
  @HttpCode(200)
  healthcheck() {
    return 'Server is health!'
  }

  @Get('/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') id: string) {
    const order = await this.getOrderDetails.execute({ orderId: id })

    if (!order) {
      throw new BadRequestException('Order request does not exists')
    }

    return order
  }

  @Get('/list/pending')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getPendingOrders(@CurrentUser() user: User) {
    return this.getUserPendingOrders.execute({ userId: user.id })
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() { productId }: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.createPendingOrder.execute({ productId, userId: user.id })
  }
}
