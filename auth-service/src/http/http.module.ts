import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { HashProvider } from '../providers/hash.provider'
import { UsersService } from '../services/users.service'
import { UsersController } from './routes/users.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, HashProvider],
})
export class HttpModule {}
