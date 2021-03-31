import { ServerCreatedEvent, Subscriber, Topic } from '@jumper251/core-module';
import { Message } from 'node-nats-streaming';
import config from '../utils/config';

const subscriber = new Subscriber(Topic.ServerCreated, config.queueGroupName);

subscriber.onMessage((data: ServerCreatedEvent, msg: Message) => {

});


export { subscriber as serverCreatedSubscriber };
