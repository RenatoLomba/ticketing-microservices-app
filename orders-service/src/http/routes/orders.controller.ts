import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser, JwtAuthGuard, User } from '@rntlombatickets/common'

import { CreatePendingOrderHandler } from '../../handlers/create-pending-order.handler'
import { GetUserPendingOrdersHandler } from '../../handlers/get-user-pending-orders.handler'
import { OrdersService } from '../../services/orders.service'
import { CreateOrderDto } from '../dtos/create-order.dto'

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly createPendingOrder: CreatePendingOrderHandler,
    private readonly getUserPendingOrders: GetUserPendingOrdersHandler,
  ) {}

  @Get('/healthcheck')
  @HttpCode(200)
  healthcheck() {
    return 'Server is health!'
  }

  @Get('/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getOrder() {
    return this.ordersService.order()
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
