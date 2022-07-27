import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { DatabaseModule } from '../database/database.module'
import { HashProvider } from '../providers/hash.provider'
import { AuthService } from '../services/auth.service'
import { UsersService } from '../services/users.service'
import { UsersController } from './routes/users.controller'

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: 'k8s-micro-services',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, HashProvider, AuthService],
})
export class HttpModule {}
