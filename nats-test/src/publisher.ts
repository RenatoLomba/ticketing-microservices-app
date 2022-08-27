import nats from 'node-nats-streaming'

console.clear()

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('Publisher connected to NATS...')

  const data = JSON.stringify({
    id: '156',
    title: 'concert',
    price: 20
  })

  // Publish data to a channel ticket:created
  stan.publish('ticket:created', data, () => {
    console.log('Event published!')
  })
})