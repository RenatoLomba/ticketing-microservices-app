import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  protected ackWait = 5 * 1000; // default 5 seconds to acknowledge message

  abstract onMessage(data: T['data'], msg: Message): void; // callback fn to handle message

  constructor(private client: Stan) {}

  subscriptionOptions() {
    return this.client.subscriptionOptions()
      // On the first time our service start, deliver all events, after that,
      // just deliver the unprocessed events
      .setDeliverAllAvailable()
      // Event must be manually acknowledged, otherwise NATS will send the event again
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      // Create a durable name to store events, if they had already been processed,
      // will not deliver them again to the same service
      .setDurableName(this.queueGroupName)
  }

  listen() {
    // Subscribe to a channel ticket:created
    // Queue group are for that the event got send to just one member of the queue group at a time
    // Other listeners outside the queue group will receive the event as well
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    // Listen to the message event on the subscription
    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      )

      const parsedData = this.parseMessage(msg)

      this.onMessage(parsedData, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()

    return typeof data === 'string' 
      ? JSON.parse(data) 
      : JSON.parse(data.toString('utf8'))
  }
}
