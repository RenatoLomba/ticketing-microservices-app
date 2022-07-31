import { faker } from '@faker-js/faker'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { RefreshToken, User } from '@prisma/client'

import { PrismaService } from '../../database/prisma/prisma.service'
import { EncryptionProvider } from '../../providers/encryption.provider'
import { HashProvider } from '../../providers/hash.provider'
import { AuthService } from '../auth.service'
import { RefreshTokenService } from '../refresh-token.service'
import { UsersService } from '../users.service'
import { expiredTokenStub } from './utils/expired-token.stub'
import { mockPrismaRefreshToken } from './utils/mock-prisma-refresh-token'
import { mockPrismaUser } from './utils/mock-prisma-user'
import { refreshTokenStub } from './utils/refresh-token.stub'
import { userStub } from './utils/user.stub'

const mockPrisma = () => {
  const users: User[] = []
  const tokens: RefreshToken[] = []

  return {
    user: mockPrismaUser(users),
    refreshToken: mockPrismaRefreshToken(tokens, users),
  }
}

describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService
  let hashProvider: HashProvider
  let refreshTokenService: RefreshTokenService
  let encryptionProvider: EncryptionProvider

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useFactory: async () => ({
            secret: 'testing-secret',
            signOptions: { expiresIn: '5m' },
          }),
        }),
      ],
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        RefreshTokenService,
        HashProvider,
        EncryptionProvider,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile()

    authService = app.get(AuthService)
    usersService = app.get(UsersService)
    jwtService = app.get(JwtService)
    hashProvider = app.get(HashProvider)
    refreshTokenService = app.get(RefreshTokenService)
    encryptionProvider = app.get(EncryptionProvider)
  })

  describe('signUp', () => {
    it('should throw an error when user already exists', async () => {
      const signUpDto = userStub()

      await usersService.createUser(signUpDto)

      await expect(authService.signUp(signUpDto)).rejects.toThrowError(
        new BadRequestException('User already exists'),
      )
    })

    it('should sign up a new user with valid properties', async () => {
      const signUpDto = userStub()
      const jwtSignSpy = jest.spyOn(jwtService, 'sign')

      const result = await authService.signUp(signUpDto)

      expect(result).toBeDefined()
      expect(result.access_token).toBeTruthy()
      expect(result.refresh_token).toBeTruthy()
      expect(result.user).toBeTruthy()
      expect(jwtSignSpy).toBeCalledTimes(1)
    })
  })

  describe('signIn', () => {
    it('should throw an error when user do not exist', async () => {
      const signInDto = {
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(5),
      }

      await expect(authService.signIn(signInDto)).rejects.toThrowError(
        new BadRequestException('Invalid email or password'),
      )
    })

    it('should throw an error when password is invalid', async () => {
      const signUpDto = userStub()
      const invalidPassword = 'invalid-password'

      const user = await usersService.createUser(signUpDto)

      await expect(
        authService.signIn({ email: user.email, password: invalidPassword }),
      ).rejects.toThrowError(
        new BadRequestException('Invalid email or password'),
      )
    })

    it('should sign in user with valid properties', async () => {
      const signUpDto = userStub()
      const hashCompareSpy = jest.spyOn(hashProvider, 'compare')
      const deleteUserTokensSpy = jest.spyOn(
        refreshTokenService,
        'deleteAllUserTokens',
      )

      const user = await usersService.createUser(signUpDto)
      const signInDto = {
        email: user.email,
        password: signUpDto.password,
      }

      const result = await authService.signIn(signInDto)

      expect(result).toBeDefined()
      expect(result.access_token).toBeTruthy()
      expect(result.refresh_token).toBeTruthy()
      expect(result.user).toBeTruthy()
      expect(hashCompareSpy).toBeCalledTimes(1)
      expect(deleteUserTokensSpy).toBeCalledTimes(1)
    })
  })

  describe('refresh', () => {
    it('should throw an error when token is invalid', async () => {
      const invalidToken = 'invalid-token'

      await expect(authService.refresh(invalidToken)).rejects.toThrowError(
        new UnauthorizedException('Invalid token'),
      )
    })

    it('should throw an error when token is expired', async () => {
      const expiredToken = expiredTokenStub()
      jest
        .spyOn(refreshTokenService, 'getToken')
        .mockResolvedValue(expiredToken)

      await expect(
        authService.refresh(expiredToken.token),
      ).rejects.toThrowError(
        new UnauthorizedException('Token expired, sign in to application'),
      )
    })

    it('should throw an error when user is invalid', async () => {
      const refreshToken = refreshTokenStub()
      jest
        .spyOn(refreshTokenService, 'getToken')
        .mockResolvedValue(refreshToken)
      jest
        .spyOn(encryptionProvider, 'decrypt')
        .mockReturnValue('invalid-user-email')

      await expect(
        authService.refresh(refreshToken.token),
      ).rejects.toThrowError(new UnauthorizedException('Invalid user'))
    })

    it('should refresh user token and return a new valid jwt token', async () => {
      const signUpDto = userStub()
      const { refresh_token } = await authService.signUp(signUpDto)
      const decryptSpy = jest.spyOn(encryptionProvider, 'decrypt')

      const result = await authService.refresh(refresh_token)

      expect(result).toHaveProperty('access_token')
      expect(result.access_token).toBeTruthy()
      expect(decryptSpy).toBeCalledTimes(1)
    })
  })

  describe('signOut', () => {
    it('should sign out user and delete all of its refresh tokens', async () => {
      const signUpDto = userStub()
      const {
        refresh_token,
        user: { id },
      } = await authService.signUp(signUpDto)

      const deleteUserTokensSpy = jest.spyOn(
        refreshTokenService,
        'deleteAllUserTokens',
      )

      expect(await authService.signOut(id)).toBeUndefined()
      expect(deleteUserTokensSpy).toBeCalledWith(id)

      const refreshToken = await refreshTokenService.getToken(refresh_token)

      expect(refreshToken).toBeNull()
    })
  })
})
