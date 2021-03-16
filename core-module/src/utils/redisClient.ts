import redis from 'redis';
import { promisify } from 'util';

import config from "../utils/config"

export class RedisClient {
    private _client?: redis.RedisClient;

    get!: (arg1: string) => Promise<string | null>;
    setex!: (arg1: string, arg2: number, arg3: string) => Promise<string>;
    set!: (arg1: string, arg2: string) => Promise<unknown>;
    del!: (key: string) => Promise<any>;
    sadd!: (key: string, element: string) => Promise<any>;
    sismember!: (arg1: string, arg2: string) => Promise<number>;
    srem!: (key: string, element: string) => Promise<any>;
    smembers!: (arg1: string) => Promise<string[]>;

    get client() {
        if (!this._client) {
            this._client = redis.createClient({ url: config.redisUrl });
            console.log('Redis connection created');
            
            this.get = promisify(this._client.get).bind(this._client);
            this.setex = promisify(this._client.setex).bind(this._client);
            this.set = promisify(this._client.set).bind(this._client);
            this.del = promisify(this._client.del).bind(this._client);
            this.sadd = promisify(this._client.sadd).bind(this._client);
            this.sismember = promisify(this._client.sismember).bind(this._client);
            this.srem = promisify(this._client.srem).bind(this._client);
            this.smembers = promisify(this._client.smembers).bind(this._client);
        }

        return this._client;
    }

}

export const redisClient = new RedisClient();