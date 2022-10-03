import { Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import { OrderCreatedEvent, Publisher, Subjects } from '@rntlombatickets/common'

@Injectable()
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  constructor(@Inject('NATS_STREAMING_CONNECTION') client: Stan) {
    super(client)
  }
}
