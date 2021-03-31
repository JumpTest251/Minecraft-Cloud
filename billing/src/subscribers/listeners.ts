import { serverCreatedSubscriber } from './serverCreatedSubscriber';

export const setupListeners = () => {
    serverCreatedSubscriber.listen();
}