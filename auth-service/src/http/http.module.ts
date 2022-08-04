import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@rntlombatickets/common'

import { DatabaseModule } from '../database/database.module'
import { EncryptionProvider } from '../providers/encryption.provider'
import { HashProvider } from '../providers/hash.provider'
import { AuthService } from '../services/auth.service'
import { RefreshTokenService } from '../services/refresh-token.service'
import { UsersService } from '../services/users.service'
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
  providers: [
    AuthService,
    UsersService,
    HashProvider,
    JwtStrategy,
    RefreshTokenService,
    EncryptionProvider,
  ],
})
export class HttpModule {}
