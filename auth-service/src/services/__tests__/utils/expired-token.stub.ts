import { previousDay } from 'date-fns'
import { v4 as uuid } from 'uuid'

import { RefreshToken } from '@prisma/client'

export const expiredTokenStub = (): RefreshToken => {
  return {
    id: uuid(),
    token: 'valid-refresh-token',
    createdAt: new Date(),
    expiresAt: previousDay(new Date(), 1),
    userId: uuid(),
  }
}
