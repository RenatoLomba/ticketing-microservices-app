import { Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@rntlombatickets/common'

@Injectable()
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated

  constructor(@Inject('NATS_STREAMING_CONNECTION') client: Stan) {
    super(client)
  }
}
