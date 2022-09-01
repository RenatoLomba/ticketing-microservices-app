import { Message, Stan } from "node-nats-streaming";
import { Listener, Subjects, TicketUpdatedEvent } from "@rntlombatickets/common";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;

  queueGroupName = 'tickets-service';

  constructor(client: Stan) {
    super(client)
  }

  onMessage(data: TicketUpdatedEvent['data'], msg: Message): void {
    console.log('Event data!', data)

    msg.ack()
  }
}