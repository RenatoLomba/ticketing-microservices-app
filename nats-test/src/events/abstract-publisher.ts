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

    return new Promise<void>((resolve, reject) => {

      // Publish data to a channel/subject
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if(err) {
          return reject(err)
        }

        console.log('Event published to subject', this.subject)

        resolve()
      })
    })
  }
}