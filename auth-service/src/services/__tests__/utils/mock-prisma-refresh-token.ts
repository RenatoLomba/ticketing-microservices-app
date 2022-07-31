import { v4 as uuid } from 'uuid'

import { Prisma, RefreshToken, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export const mockPrismaRefreshToken = (
  tokensDb: RefreshToken[],
  usersDb: User[],
) => {
  return {
    findUnique: async ({ where }: Prisma.RefreshTokenFindUniqueArgs) => {
      return (
        tokensDb.find((tk) =>
          where.id ? tk.id === where.id : tk.token === where.token,
        ) || null
      )
    },
    findMany: async ({ where }: Prisma.RefreshTokenFindManyArgs) => {
      return tokensDb.filter((token) => token.userId === where.userId)
    },
    deleteMany: async ({ where }: Prisma.RefreshTokenDeleteManyArgs) => {
      tokensDb = tokensDb.filter((token) => token.userId !== where.userId)
    },
    create: ({ data }: Prisma.RefreshTokenCreateArgs) => {
      return new Promise<RefreshToken>((resolve, rejects) => {
        const user = usersDb.find((u) => u.id === data.userId)

        if (!user) {
          rejects(
            new PrismaClientKnownRequestError(
              'Failed constraint',
              'P2003',
              'v1',
            ),
          )
        }

        const tokenAlreadyExists = tokensDb.find(
          (tk) => tk.token === data.token,
        )

        if (!!tokenAlreadyExists) {
          rejects(
            new PrismaClientKnownRequestError('Duplicate keys', 'P2002', 'v1'),
          )
        }

        const newToken: RefreshToken = {
          ...data,
          userId: user.id,
          expiresAt: new Date(data.expiresAt),
          createdAt: new Date(),
          id: uuid(),
        }
        tokensDb.push(newToken)
        resolve(newToken)
      })
    },
  }
}
