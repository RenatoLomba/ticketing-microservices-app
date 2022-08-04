import { addHours } from 'date-fns'
import { v4 as uuid } from 'uuid'

import { RefreshToken } from '@prisma/client'

export const refreshTokenStub = (): RefreshToken => {
  return {
    id: uuid(),
    createdAt: new Date(),
    expiresAt: addHours(new Date(), 12),
    token: 'valid-token',
    userId: 'invalid-user-id',
  }
}
