# Setup kafka cluster
**For development purpose only**

- Uses [docker-compose.yml](kafka-cluster/docker-compose.yml) to create a kafka cluster including two `zookeeper` and three `kafa` nodes in a single machine

```sh
cd examples

docker-compose up -d

# check zookeeper instances

docker run --net=host --rm confluentinc/cp-zookeeper:5.3.1 bash -c "echo stat | nc localhost 2181 | grep Mode"
docker run --net=host --rm confluentinc/cp-zookeeper:5.3.1 bash -c "echo stat | nc localhost 2182 | grep Mode"

# Mode: leader
# Mode: follower

# check kafka instances
docker logs kafka1 | grep started

# [2019-11-12 04:13:23,876] INFO [Kafka Server 1], started (kafka.server.KafkaServer)

# check kafka brokers
kafkacat -b localhost:9092 -L

# Metadata for all topics (from broker -1: localhost:9092/bootstrap):
# 3 brokers:
#  broker 2 at 127.0.0.1:9092
#  broker 3 at 127.0.0.1:9093
#  broker 1 at 127.0.0.1:9091
```

# Publishing messages

```javascript
import Client from 'strong-pubsub'
import Adapter from 'strong-pubsub-kafka'

const options = { kafkaHost: '127.0.0.1:9091,127.0.0.1:9092,127.0.0.1:9093' }
const client = new Client(options, Adapter)

const max = 3
for (let idx = 0; idx < max; idx++) {
  let msg = `message-${idx}`
  client.publish('test', msg, {}, (err, resp) => {
    if (err) console.error('Publishing failed', err)
    else console.log(resp)
  })
}

// { 'test': { '0': 0 } }
// { 'test': { '1': 1 } }
// { 'test': { '2': 2 } }
```

# Consuming messages

```javascript
  client.subscribe('test')
  client.on('message', function(topic, msg) {
    console.log('Incoming message...', topic, msg)
  })

//  Incoming message... test { topic: 'test',
//  value: 'message-1',
//  offset: 2,
//  partition: 1,
//  highWaterOffset: 3,
//  key: null,
//  timestamp: 2019-11-12T16:59:13.952Z }
```

# References

- [Kafka Document](https://kafka.apache.org/documentation/)
- [Kafkacat](https://github.com/edenhill/kafkacat)
