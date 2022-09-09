import { faker } from '@faker-js/faker'

export const CreateProductDatabaseStub = () => {
  return {
    id: faker.datatype.uuid(),
    externalId: faker.datatype.uuid(),
    title: 'Ticket ' + faker.random.alphaNumeric(5),
    price: faker.datatype.float(),
  }
}
