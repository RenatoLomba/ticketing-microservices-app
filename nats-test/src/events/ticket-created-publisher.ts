import { Stan } from "node-nats-streaming";
import { Publisher } from "./abstract-publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  constructor(client: Stan) {
    super(client)
  }
}