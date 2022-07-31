import { v4 as uuid } from 'uuid'

import { Prisma, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export const mockPrismaUser = (usersDb: User[]) => {
  return {
    findUnique: ({ where }: Prisma.UserFindUniqueArgs) =>
      usersDb.find((user) =>
        !!where.id ? user.id === where.id : user.email === where.email,
      ) || null,
    create: ({ data }: Prisma.UserCreateArgs) => {
      return new Promise<User>((resolve, rejects) => {
        const userAlreadyExists = usersDb.find(
          (user) => user.email === data.email,
        )

        if (userAlreadyExists) {
          rejects(
            new PrismaClientKnownRequestError('Duplicate keys', 'P2002', 'v1'),
          )
        }

        const newUser: User = { ...data, createdAt: new Date(), id: uuid() }
        usersDb.push(newUser)
        resolve(newUser)
      })
    },
  }
}
