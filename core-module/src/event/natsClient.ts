import nats, { Stan, StanOptions } from 'node-nats-streaming';


class NatsClient {
    private _client?: Stan;

    get client() {
        if (!this._client) {
            throw new Error('Not connected to NATS');
        }

        return this._client;
    }

    connect(clusterId: string, clientId: string, options: StanOptions) {
        this._client = nats.connect(clusterId, clientId, options);

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                resolve()
            })

            this.client.on('error', err => reject(err));
        })
    }

}

export const natsClient = new NatsClient();