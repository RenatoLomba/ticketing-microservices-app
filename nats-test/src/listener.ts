import nats, { Message } from 'node-nats-streaming'

console.clear()

const stan = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('Listener connected to NATS...')

  // Subscribe to a channel ticket:created
  const subscription = stan.subscribe('ticket:created')

  // Listen to the message event on the subscription
  subscription.on('message', (msg: Message) => {
    const data = msg.getData()

    if(typeof data !== 'string') return

    console.log('Message sequence: ', msg.getSequence())
    console.log('Message data: ', JSON.parse(data))
  })
})