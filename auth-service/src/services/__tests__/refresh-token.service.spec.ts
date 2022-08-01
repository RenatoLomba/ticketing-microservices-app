import { faker } from '@faker-js/faker'
import { ForbiddenException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Prisma, RefreshToken, User } from '@prisma/client'

import { PrismaService } from '../../database/prisma/prisma.service'
import { EncryptionProvider } from '../../providers/encryption.provider'
import { RefreshTokenService } from '../refresh-token.service'
import { mockPrismaRefreshToken } from './utils/mock-prisma-refresh-token'
import { mockPrismaUser } from './utils/mock-prisma-user'
import { userStub } from './utils/user.stub'

const mockPrisma = () => {
  const users: User[] = []
  const tokens: RefreshToken[] = []

  return {
    user: mockPrismaUser(users),
    refreshToken: mockPrismaRefreshToken(tokens, users),
  }
}

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService
  let encryptionProvider: EncryptionProvider
  let prisma: PrismaService

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [RefreshTokenService, EncryptionProvider, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile()

    refreshTokenService = app.get(RefreshTokenService)
    encryptionProvider = app.get(EncryptionProvider)
    prisma = app.get(PrismaService)
  })

  describe('createToken', () => {
    it('should create a token when passing valid params', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })

      expect(await refreshTokenService.createToken(user)).toHaveProperty('id')
    })

    it('should encrypt user email before create token', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })
      const encryptionSpy = jest.spyOn(encryptionProvider, 'crypt')

      await refreshTokenService.createToken(user)

      expect(encryptionSpy).toBeCalledWith(user.email)
    })

    it('should throw an error when trying to create a token for a inexistent user', async () => {
      const user = {
        id: faker.datatype.uuid(),
        email: faker.internet.email(),
      }

      await expect(refreshTokenService.createToken(user)).rejects.toThrowError(
        new ForbiddenException('User not found'),
      )
    })

    it('should throw an error when trying to create a token with duplicate value', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })
      jest
        .spyOn(encryptionProvider, 'crypt')
        .mockImplementation(() => user.email)

      await refreshTokenService.createToken(user)

      await expect(refreshTokenService.createToken(user)).rejects.toThrowError(
        new ForbiddenException('Duplicate user token'),
      )
    })

    it('should throw an unknown error when trying to create token', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })
      jest.spyOn(prisma.refreshToken, 'create').mockImplementation(() => {
        return {
          catch: (callback) => {
            callback(new Error('Unknown error'))
          },
        } as Prisma.Prisma__RefreshTokenClient<RefreshToken>
      })

      await expect(refreshTokenService.createToken(user)).rejects.toThrowError(
        new Error('Unknown error'),
      )
    })
  })

  describe('deleteAllUserTokens', () => {
    it('should delete all user tokens by a user id', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })

      await refreshTokenService.createToken(user)

      expect(
        (await prisma.refreshToken.findMany({ where: { userId: user.id } }))
          .length,
      ).toBe(1)

      await refreshTokenService.deleteAllUserTokens(user.id)

      expect(
        (await prisma.refreshToken.findMany({ where: { userId: user.id } }))
          .length,
      ).toBe(0)
    })

    it('should not delete user tokens if id is not the same passed', async () => {
      const firstUser = await prisma.user.create({ data: userStub() })
      const secondUser = await prisma.user.create({ data: userStub() })

      await refreshTokenService.createToken(firstUser)
      await refreshTokenService.createToken(secondUser)

      await refreshTokenService.deleteAllUserTokens(firstUser.id)

      expect(
        (
          await prisma.refreshToken.findMany({
            where: { userId: firstUser.id },
          })
        ).length,
      ).toBe(0)
      expect(
        (
          await prisma.refreshToken.findMany({
            where: { userId: secondUser.id },
          })
        ).length,
      ).toBe(1)
    })
  })

  describe('getToken', () => {
    it('should pass a valid token and return null', async () => {
      const token = 'valid-user-token'

      expect(await refreshTokenService.getToken(token)).toBe(null)
    })

    it('should pass a valid token and return respective refresh token', async () => {
      const userDto = userStub()
      const user = await prisma.user.create({ data: userDto })

      const { token } = await refreshTokenService.createToken(user)

      const refreshToken = await refreshTokenService.getToken(token)

      expect(refreshToken).toHaveProperty('token')
      expect(refreshToken.token).toBe(token)
    })
  })
})
