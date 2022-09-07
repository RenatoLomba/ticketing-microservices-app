import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { CreatePendingOrderHandler } from '../handlers/create-pending-order.handler'
import { GetOrderDetailsHandler } from '../handlers/get-order-details.handler'
import { GetUserPendingOrdersHandler } from '../handlers/get-user-pending-orders.handler'
import { OrdersService } from '../services/orders.service'
import { OrdersController } from './routes/orders.controller'

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [
    JwtStrategy,
    OrdersService,
    CreatePendingOrderHandler,
    GetUserPendingOrdersHandler,
    GetOrderDetailsHandler,
  ],
})
export class HttpModule {}
