import { v4 as uuid } from 'uuid'

import { faker } from '@faker-js/faker'
import { ForbiddenException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Prisma, RefreshToken, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../../database/prisma/prisma.service'
import { EncryptionProvider } from '../../providers/encryption.provider'
import { RefreshTokenService } from '../refresh-token.service'
import { userStub } from './utils/user.stub'

const mockPrisma = () => {
  const users: User[] = []
  let tokens: RefreshToken[] = []

  return {
    user: {
      create: ({ data }: Prisma.UserCreateArgs) => {
        return new Promise<User>((resolve) => {
          const newUser: User = { ...data, createdAt: new Date(), id: uuid() }
          users.push(newUser)
          resolve(newUser)
        })
      },
    },
    refreshToken: {
      findUnique: async ({ where }: Prisma.RefreshTokenFindUniqueArgs) => {
        return tokens.find((tk) => tk.token === where.token) || null
      },
      findMany: async ({ where }: Prisma.RefreshTokenFindManyArgs) => {
        return tokens.filter((token) => token.userId === where.userId)
      },
      deleteMany: async ({ where }: Prisma.RefreshTokenDeleteManyArgs) => {
        tokens = tokens.filter((token) => token.userId !== where.userId)
      },
      create: ({ data }: Prisma.RefreshTokenCreateArgs) => {
        return new Promise<RefreshToken>((resolve, rejects) => {
          const user = users.find((u) => u.id === data.userId)

          if (!user) {
            rejects(
              new PrismaClientKnownRequestError(
                'Failed constraint',
                'P2003',
                'v1',
              ),
            )
          }

          const tokenAlreadyExists = tokens.find(
            (tk) => tk.token === data.token,
          )

          if (!!tokenAlreadyExists) {
            rejects(
              new PrismaClientKnownRequestError(
                'Duplicate keys',
                'P2002',
                'v1',
              ),
            )
          }

          const newToken: RefreshToken = {
            ...data,
            userId: user.id,
            expiresAt: new Date(data.expiresAt),
            createdAt: new Date(),
            id: uuid(),
          }
          tokens.push(newToken)
          resolve(newToken)
        })
      },
    },
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
