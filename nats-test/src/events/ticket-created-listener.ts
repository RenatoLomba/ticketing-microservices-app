import { Message, Stan } from "node-nats-streaming"

import { Listener } from "./abstract-listener"
import { Subjects } from "./subjects"
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  queueGroupName = 'payments-service';

  constructor(client: Stan) {
    super(client)
  }

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data)

    // Manually acknowledge that the event is processed successfully, 
    // otherwise it would be sent again until it is acknowledged
    msg.ack()
  }
}
