import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'
import { OrdersRepository } from './repositories/orders.repository'
import { ProductsRepository } from './repositories/products.repository'

@Module({
  providers: [PrismaService, ProductsRepository, OrdersRepository],
  exports: [ProductsRepository, OrdersRepository],
})
export class DatabaseModule {}
