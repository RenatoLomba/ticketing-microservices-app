import { Message, Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import {
  Listener,
  QUEUE_GROUPS,
  Subjects,
  TicketUpdatedEvent,
} from '@rntlombatickets/common'

import { UpdateProductHandler } from '../../handlers'

@Injectable()
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated

  queueGroupName = QUEUE_GROUPS.ORDERS_SERVICE

  constructor(
    @Inject(UpdateProductHandler)
    private readonly updateProduct: UpdateProductHandler,
    @Inject('NATS_STREAMING_CONNECTION') client: Stan,
  ) {
    super(client)
  }

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    await this.updateProduct.execute({
      externalId: data.id,
      price: data.price,
      title: data.title,
      version: data.version,
    })

    msg.ack()
  }
}
