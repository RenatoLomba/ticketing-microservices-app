import nats, { Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('Listener connected to NATS...')

  // Subscribe to a channel ticket:created
  // Queue group are for that the event got send to just one member of the queue group at a time
  // Other listeners outside the queue group will receive the event as well
  const subscription = stan.subscribe('ticket:created', 'listener-queue-group')

  // Listen to the message event on the subscription
  subscription.on('message', (msg: Message) => {
    const data = msg.getData()

    if(typeof data !== 'string') return

    console.log('Message sequence: ', msg.getSequence())
    console.log('Message data: ', JSON.parse(data))
  })
})