import { Injectable } from '@nestjs/common'

@Injectable()
export class OrdersService {
  order() {
    return {
      id: 'abc',
      title: 'Hello world',
      createdAt: new Date(),
    }
  }
}
