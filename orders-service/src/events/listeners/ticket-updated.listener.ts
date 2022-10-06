import { Message, Stan } from 'node-nats-streaming'

import { Inject } from '@nestjs/common'
import { Listener, Subjects, TicketUpdatedEvent } from '@rntlombatickets/common'

import { UpdateProductHandler } from '../../handlers'
import { QueueGroups } from './queue-groups'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated

  queueGroupName = QueueGroups.ORDERS_SERVICE

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
    })

    msg.ack()
  }
}
