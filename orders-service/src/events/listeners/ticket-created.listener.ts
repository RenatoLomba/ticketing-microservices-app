import { Message, Stan } from 'node-nats-streaming'

import { Inject, Injectable } from '@nestjs/common'
import { Listener, Subjects, TicketCreatedEvent } from '@rntlombatickets/common'

import { CreateProductHandler } from '../../handlers/create-product.handler'

@Injectable()
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated

  queueGroupName = 'orders-service'

  constructor(
    @Inject(CreateProductHandler)
    private readonly createProduct: CreateProductHandler,
    @Inject('NATS_STREAMING_CONNECTION') client: Stan,
  ) {
    super(client)
  }

  async onMessage(
    data: TicketCreatedEvent['data'],
    msg: Message,
  ): Promise<void> {
    await this.createProduct.execute({
      externalId: data.id,
      price: data.price,
      title: data.title,
    })

    msg.ack()
  }
}
