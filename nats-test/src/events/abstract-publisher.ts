import { Stan } from "node-nats-streaming";

import { Subjects } from "./subjects";

interface Event {
  subject: Subjects
  data: any
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject']

  constructor(private client: Stan) {}

  publish(data: T['data']) {
    // Publish data to a channel/subject
    this.client.publish(this.subject, JSON.stringify(data), () => {
      console.log('Event callback!')
    })
  }
}