import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { CreatePendingOrderHandler } from '../handlers/create-pending-order.handler'
import { GetOrderDetailsHandler } from '../handlers/get-order-details.handler'
import { GetUserOrdersHandler } from '../handlers/get-user-orders.handler'
import { OrdersController } from './routes/orders.controller'

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [
    JwtStrategy,
    CreatePendingOrderHandler,
    GetUserOrdersHandler,
    GetOrderDetailsHandler,
  ],
})
export class HttpModule {}
