import { sign } from 'jsonwebtoken'

import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'
import { User } from '@rntlombatickets/common'

export const authTokenMock = (config: ConfigService) => {
  const user: User = {
    id: faker.datatype.uuid(),
    name: faker.name.findName(),
    email: faker.internet.email(),
  }
  const jwtSecretKey = config.get<string>('JWT_KEY')

  const token = sign({ name: user.name, email: user.email }, jwtSecretKey, {
    subject: user.id,
  })

  return { user, access_token: token }
}
