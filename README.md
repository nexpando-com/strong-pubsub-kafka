# strong-pubsub-kafka
Pubsub adapter for Kafka broker

# Installation

```sh
npm add https://github.com/nexpando-com/strong-pubsub-kafka.git --save
```

# Usage

```javascript
import Client from 'strong-pubsub'
import Adapter from 'strong-pubsub-kafka'

const options = { kafkaHost: 'localhost:9092' }
const client = new Client(options, Adapter)

const connect = () => {
  return new Promise((resovle, reject) => {
    client.connect((err) => {
      if (err) reject()
      resovle()
    })
  })
}

const run = async () => {
  await connect()
  client.subscribe('test')

  client.on('message', function(topic, msg) {
    console.log('Incoming message...', topic, msg)
  })

  client.publish('test', 'test message', {}, (err, resp) => {
    if (err) console.error('Publishing failed', err)
    else console.log(resp)
  })
}
```