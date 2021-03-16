import { Topic } from './Topic';
import { EventData } from './events';

import { natsClient } from './natsClient';
import { Stan } from 'node-nats-streaming';


export class Publisher {
    topic: Topic;
    private client: Stan;

    constructor(topic: Topic) {
        this.topic = topic;
        this.client = natsClient.client;
    }

    publish(data: EventData) {
        return new Promise<void>((resolve, reject) => {
            this.client.publish(this.topic, JSON.stringify(data), (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            })
        })
    }
}