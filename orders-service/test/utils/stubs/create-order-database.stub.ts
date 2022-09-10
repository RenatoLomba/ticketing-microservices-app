import { addSeconds } from 'date-fns'

import { faker } from '@faker-js/faker'
import { ORDER_STATUS } from '@rntlombatickets/common'

interface ICreateOrderDatabaseStubData {
  userId: string
  productId: string
  secondsToExpire?: number
}

export const CreateOrderDatabaseStub = ({
  productId,
  userId,
  secondsToExpire = 15 * 60,
}: ICreateOrderDatabaseStubData) => {
  return {
    id: faker.datatype.uuid(),
    userId,
    productId,
    status: ORDER_STATUS.CREATED,
    expiresAt: addSeconds(new Date(), secondsToExpire),
  }
}
