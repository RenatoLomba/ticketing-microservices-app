import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'

export const userStub = (): Prisma.UserCreateInput => {
  return {
    email: faker.internet.email(),
    name: faker.name.findName(),
    password: faker.random.alphaNumeric(5),
  }
}
