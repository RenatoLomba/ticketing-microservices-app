import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { CreatePendingOrderHandler } from '../handlers/create-pending-order.handler'
import { GetOrderDetailsHandler } from '../handlers/get-order-details.handler'
import { GetProductByExternal } from '../handlers/get-product-by-external.handler'
import { GetUserOrdersHandler } from '../handlers/get-user-orders.handler'
import { ValidateProductIsReservedHandler } from '../handlers/validate-product-is-reserved.handler'
import { OrdersController } from './routes/orders.controller'

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [
    JwtStrategy,
    CreatePendingOrderHandler,
    GetUserOrdersHandler,
    GetOrderDetailsHandler,
    GetProductByExternal,
    ValidateProductIsReservedHandler,
  ],
})
export class HttpModule {}
