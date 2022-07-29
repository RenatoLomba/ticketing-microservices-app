import { v4 as uuid } from 'uuid'

import { faker } from '@faker-js/faker'
import { ForbiddenException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Prisma, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { PrismaService } from '../../database/prisma/prisma.service'
import { HashProvider } from '../../providers/hash.provider'
import { UsersService } from '../users.service'
import { userStub } from './utils/user.stub'

const mockPrisma = () => {
  const users: User[] = []

  return {
    user: {
      findUnique: ({ where }: Prisma.UserFindUniqueArgs) =>
        users.find((user) =>
          !!where.id ? user.id === where.id : user.email === where.email,
        ) || null,
      create: ({ data }: Prisma.UserCreateArgs) => {
        return new Promise<User>((resolve, rejects) => {
          const userAlreadyExists = users.find(
            (user) => user.email === data.email,
          )

          if (userAlreadyExists) {
            rejects(
              new PrismaClientKnownRequestError(
                'Duplicate keys',
                'P2002',
                'v1',
              ),
            )
          }

          const newUser: User = { ...data, createdAt: new Date(), id: uuid() }
          users.push(newUser)
          resolve(newUser)
        })
      },
    },
  }
}

describe('UsersService', () => {
  let usersService: UsersService
  let prisma: PrismaService
  let hashProvider: HashProvider

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [UsersService, HashProvider, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile()

    usersService = app.get(UsersService)
    prisma = app.get(PrismaService)
    hashProvider = app.get(HashProvider)
  })

  describe('getUserById', () => {
    it('should pass a valid id and return null', async () => {
      const id = faker.datatype.uuid()
      const expectedResult = null

      expect(await usersService.getUserById(id)).toBe(expectedResult)
    })

    it('should pass a valid id and return respective user', async () => {
      const user = await prisma.user.create({
        data: userStub(),
      })
      const expectedResult = { ...user }

      expect(await usersService.getUserById(user.id)).toEqual(expectedResult)
    })
  })

  describe('getUserByEmail', () => {
    it('should pass a valid email and return null', async () => {
      const email = faker.internet.email()
      const expectedResult = null

      expect(await usersService.getUserByEmail(email)).toBe(expectedResult)
    })

    it('should pass a valid email and return respective user', async () => {
      const user = await prisma.user.create({
        data: userStub(),
      })
      const expectedResult = { ...user }

      expect(await usersService.getUserByEmail(user.email)).toEqual(
        expectedResult,
      )
    })
  })

  describe('createUser', () => {
    it('should create a user passing valid params', async () => {
      const userDto = userStub()
      const expectedResult = userDto.email

      const user = await usersService.createUser(userDto)

      expect(user).toHaveProperty('id')
      expect(user.email).toBe(expectedResult)
    })

    it('should hash user password before create', async () => {
      const userDto = userStub()
      const hashSpy = jest.spyOn(hashProvider, 'toHash')

      await usersService.createUser(userDto)

      expect(hashSpy).toHaveBeenCalledWith(userDto.password)
    })

    it('should throw an error when trying to create user with duplicate email', async () => {
      const userDto = userStub()
      await usersService.createUser(userDto)

      await expect(usersService.createUser(userDto)).rejects.toThrowError(
        new ForbiddenException('Duplicate user email'),
      )
    })
  })
})
