import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { UsersService } from '../services/users/users.service'
import { UsersController } from './routes/users.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class HttpModule {}
