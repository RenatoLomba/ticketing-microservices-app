import { Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@rntlombatickets/common'

@Injectable()
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled

  constructor(@Inject('NATS_STREAMING_CONNECTION') client: Stan) {
    super(client)
  }
}
