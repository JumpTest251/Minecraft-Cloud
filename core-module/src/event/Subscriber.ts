import { Topic } from './Topic';
import { EventData } from './events';

import { natsClient } from './natsClient';
import { Stan, Message } from 'node-nats-streaming';

export class Subscriber {
    topic: Topic;
    queueGroupName: string;
    messageHandler?(data: EventData, msg: Message): void;
    private client: Stan;
    ackWait = 5 * 1000;

    constructor(topic: Topic, queueGroupName: string, messageHandler?: (data: EventData, msg: Message) => void) {
        this.topic = topic;
        this.queueGroupName = queueGroupName;

        this.client = natsClient.client;

        if (messageHandler) this.messageHandler = messageHandler;
    }

    onMessage<T extends EventData>(messageHandler: (data: T, msg: Message) => void) {
        this.messageHandler = messageHandler;
    }

    listen() {
        const subscription = this.client.subscribe(
            this.topic,
            this.queueGroupName,
            this.client
                .subscriptionOptions()
                .setDeliverAllAvailable()
                .setManualAckMode(true)
                .setAckWait(this.ackWait)
                .setDurableName(this.queueGroupName)
        );

        subscription.on('message', (msg: Message) => {
            if (this.messageHandler) {
                this.messageHandler(this.parseMessage(msg), msg);
            }
        })
    }

    parseMessage(msg: Message) {
        const data = msg.getData();

        return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
    }
}