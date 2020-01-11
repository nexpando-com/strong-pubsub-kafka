import Client from 'strong-pubsub'
import Adapter from '../src/index'

const options = { kafkaHost: 'localhost:19092,localhost:29092,localhost:39092' }
const client = new Client(options, Adapter)

const connect = () => {
  return new Promise((resovle, reject) => {
    client.connect((err) => {
      if (err) reject()
      resovle()
    })
  })
}

describe("Connect to broker", async function() {
  console.log('trying to connect')
  await connect()
  console.log('connected')
  client.subscribe('test')
  client.on('message', function(topic, msg) {
    console.log('Incoming message...', topic, msg)
  })

  const max = 10000
  for (let idx = 0; idx < max; idx++) {
    let msg = `message-${idx}`
    client.publish('test', msg, {}, (err, resp) => {
      if (err) console.error('Publishing failed', err)
      else console.log(resp)
    })
  }
})