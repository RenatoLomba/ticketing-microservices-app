import { Message, Stan } from "node-nats-streaming";
import { Listener, Subjects, TicketCreatedEvent } from "@rntlombatickets/common";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName = 'tickets-service';

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
