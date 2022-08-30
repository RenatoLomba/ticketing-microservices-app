import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', 'publisher-client', {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('Publisher connected to NATS...')

  const ticketCreatedPublisher = new TicketCreatedPublisher(stan)

  ticketCreatedPublisher.publish({
    id: '156',
    title: 'concert',
    price: 20
  })
})