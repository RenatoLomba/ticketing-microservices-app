import { Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@rntlombatickets/common'

@Injectable()
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated

  constructor(@Inject('NATS_STREAMING_CONNECTION') client: Stan) {
    super(client)
  }
}
