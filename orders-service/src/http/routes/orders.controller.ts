import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@rntlombatickets/common'

import { OrdersService } from '../../services/orders.service'

@Controller('/api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
}
