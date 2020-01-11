"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _kafkaNode = _interopRequireDefault(require("kafka-node"));

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultConnectRetryOptions = {
  forever: true,
  retries: 5,
  factor: 3,
  minTimeout: 1 * 1000,
  maxTimeout: 60 * 1000,
  randomize: true
};
const KAFKA_CLIENT_ID = process.env.kAFKA_CLIENT_ID || 'strong-pubsub-kafka';
const KAFKA_CONSUMER_GROUP_ID = process.env.KAFKA_CONSUMER_GROUP_ID || 'strong-pubsub-kafka';
const KAFKA_HOSTS = process.env.KAFKA_HOSTS || 'localhost:9092';
const kafkaOptions = {
  kafkaHost: KAFKA_HOSTS,
  clientId: KAFKA_CLIENT_ID,
  autoConnect: true,
  connectRetryOptions: defaultConnectRetryOptions
};
const consumerGroupOptions = {
  kafkaHost: KAFKA_HOSTS,
  groupId: KAFKA_CONSUMER_GROUP_ID,
  sessionTimeout: 15000,
  protocol: ['roundrobin'],
  encoding: 'utf8',
  fromOffset: 'latest',
  commitOffsetsOnFirstJoin: true,
  outOfRangeOffset: 'earliest',
  onRebalance: (isAlreadyMember, callback) => {
    callback();
  } // or null

}; // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0

const producerOptions = {
  requireAcks: 1,
  ackTimeoutMs: 100,
  partitionerType: 2
};
const {
  ConsumerGroup,
  Producer,
  KafkaClient
} = _kafkaNode.default;

class Adapter extends _events.EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.options = client.options;
  }

  connect(cb) {
    this.kafkaClient = new KafkaClient({ ...kafkaOptions,
      ...this.options
    });
    this.producer = new Producer(this.kafkaClient, { ...producerOptions,
      ...this.options
    });
    this.producer.on('ready', () => {
      cb && cb();
    });
    this.producer.on('error', error => {
      cb && cb(error);
    });
  }

  end(cb) {
    this.kafkaClient.close(cb);
  }

  publish(topic, message, options, cb) {
    // 0: No compression, 1: Compress using GZip, 2: Compress using snappy
    let {
      attributes = 0,
      key,
      partition
    } = options;
    let timestamp = Date.now();
    let payload = {
      topic,
      messages: [message],
      attributes,
      timestamp
    };
    payload = key ? { ...payload,
      key
    } : payload;
    payload = partition ? { ...payload,
      partition
    } : payload;
    let payloads = [payload];
    this.producer.send(payloads, (error, data) => {
      cb && cb(error, data);
    });
  }

  subscribe(topic, options, cb) {
    let {
      kafkaHost
    } = this.options;
    let _options = { ...consumerGroupOptions,
      kafkaHost,
      ...options
    };
    this.consumerGroup = new ConsumerGroup(_options, topic);
    let client = this.client;
    this.consumerGroup.on('connect', () => {
      client.emit('connect', topic, _options);
    });
    this.consumerGroup.on('message', message => {
      let {
        topic
      } = message;
      client.emit('message', topic, message);
    });
    this.consumerGroup.on('error', error => {
      cb && cb(error, null);
    });
  }

  unsubscribe(topic, cb) {
    this.consumerGroup.close(cb);
  }

}

exports.default = Adapter;