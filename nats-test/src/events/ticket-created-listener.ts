import { Message, Stan } from "node-nats-streaming"

import { Listener } from "./abstract-listener"

export class TicketCreatedListener extends Listener {
  subject = 'ticket:created'

  queueGroupName = 'payments-service'

  constructor(client: Stan) {
    super(client)
  }

  onMessage(data: any, msg: Message): void {
    console.log('Event data!', data)

    // Manually acknowledge that the event is processed successfully, 
    // otherwise it would be sent again until it is acknowledged
    msg.ack()
  }
}
