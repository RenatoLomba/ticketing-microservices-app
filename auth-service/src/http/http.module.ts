import { Module } from '@nestjs/common'

import { AppService } from '../services/app.service'
import { AppController } from './routes/app.controller'
import { UsersController } from './routes/users.controller'

@Module({
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class HttpModule {}
