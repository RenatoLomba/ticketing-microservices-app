import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'

import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()

const stan = nats.connect('ticketing', 
  `listener-client-${randomBytes(4).toString('hex')}`, 
  {
    url: 'http://localhost:4222'
  }
)

stan.on('connect', () => {
  console.log('Listener connected to NATS...')

  // On connection close, shuts the process down, to not receive anymore events
  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })

  new TicketCreatedListener(stan).listen()
})

// Whenever the service is shut down (restart or completely off), close the connection to NATS
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
