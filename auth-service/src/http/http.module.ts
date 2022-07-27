import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { DatabaseModule } from '../database/database.module'
import { HashProvider } from '../providers/hash.provider'
import { AuthService } from '../services/auth.service'
import { UsersService } from '../services/users.service'
import { JwtStrategy } from './auth/jwt.strategy'
import { UsersController } from './routes/users.controller'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_KEY')

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '15m' },
        }
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, HashProvider, AuthService, JwtStrategy],
})
export class HttpModule {}
