import 'babel-polyfill'
import Client from 'strong-pubsub'
import Adapter from '../src/kafka-adapter'

const options = {}
const client = new Client(options, Adapter)

const connect = () => {
  return new Promise((resovle, reject) => {
    client.connect((err) => {
      if (err) reject()
      resovle()
    })
  })
}

(async() => {
  try {
    await connect()
    client.subscribe('messages')
    client.on('message', function(topic, msg) {
      console.log('on message...', topic, msg)
    })

    client.publish('test', { x: 1, y: 2 }, {}, (err, resp) => {
      console.log(resp)
    })
  } catch(err) {
    console.error(err)
  }
})()