import { Module } from '@nestjs/common'

import { UsersService } from '../services/users.service'
import { UsersController } from './routes/users.controller'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class HttpModule {}
