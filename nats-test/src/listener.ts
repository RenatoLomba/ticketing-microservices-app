import nats, { Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

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

  const options = stan.subscriptionOptions()
    // Event must be manually acknowledged, otherwise NATS will send the event again
    .setManualAckMode(true)

  // Subscribe to a channel ticket:created
  // Queue group are for that the event got send to just one member of the queue group at a time
  // Other listeners outside the queue group will receive the event as well
  const subscription = stan.subscribe(
    'ticket:created', 'listener-queue-group', options
  )

  // Listen to the message event on the subscription
  subscription.on('message', (msg: Message) => {
    const data = msg.getData()

    if(typeof data !== 'string') return

    console.log('Message sequence: ', msg.getSequence())
    console.log('Message data: ', JSON.parse(data))

    // Manually acknowledge that the event is processed successfully, 
    // otherwise it would be sent again until it is acknowledged
    msg.ack()
  })
})

// Whenever the service is shut down (restart or completely off), close the connection to NATS
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
