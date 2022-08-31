import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { EventsModule } from '../events/events.module'
import { TicketsService } from '../services/tickets.service'
import { TicketsController } from './routes/tickets.controller'

@Module({
  imports: [ConfigModule, DatabaseModule, EventsModule],
  controllers: [TicketsController],
  providers: [JwtStrategy, TicketsService],
})
export class HttpModule {}
