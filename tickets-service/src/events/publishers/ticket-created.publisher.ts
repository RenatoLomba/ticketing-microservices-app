import { Stan } from 'node-nats-streaming'

import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@rntlombatickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated

  constructor(client: Stan) {
    super(client)
  }
}
