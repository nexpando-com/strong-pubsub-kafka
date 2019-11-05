import 'babel-polyfill'
import Client from 'strong-pubsub'
import Adapter from '../index'

const client = new Client({}, Adapter)

const connect = () => {
  return new Promise((resovle, reject) => {
    client.connect((err) => {
      if (err) reject()
      resovle()
    })
  })
}

describe("Connect to broker", async function() {
  await connect()
})