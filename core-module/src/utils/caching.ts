import redis from 'redis';
import { promisify } from 'util';

import config from "../utils/config"

const client = redis.createClient({ url: config.redisUrl })

const get = promisify(client.get).bind(client);
const setex = promisify(client.setex).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client) as (key: string) => Promise<any>;
const sadd = promisify(client.sadd).bind(client) as (key: string, element: string) => Promise<any>;
const sismember = promisify(client.sismember).bind(client);
const srem = promisify(client.srem).bind(client) as (key: string, element: string) => Promise<any>;
const smembers = promisify(client.smembers).bind(client);


export class Cache {
    key: string;
    ex: number;
    json: boolean

    constructor(key: string, ex = 3600, json = true) {
        this.key = key;
        this.ex = ex;
        this.json = json;
    }

    async get(loader: (key: string) => Promise<any>) {
        try {
            const data = await get(this.key);
            if (data)
                return this.json ? JSON.parse(data) : data;

            if (loader && typeof loader === 'function') {
                const result = await loader(this.key);
                if (result) {
                    await this.set(this.json ? JSON.stringify(result) : result);
                }

                return result;
            }

            return loader;
        } catch (ex) {
            console.log('Redis err: ' + ex);
        }
    }
    set(value: string) {
        if (this.ex === 0) {
            return set(this.key, value);
        } else {
            return setex(this.key, this.ex, value);
        }
    }
    clear() {
        return del(this.key);
    }
}



export class CachedSet {
    key: string

    constructor(key: string) {
        this.key = key;
    }
    add(element: string) {
        return sadd(this.key, element);
    }
    contains(element: string) {
        return sismember(this.key, element);
    }
    remove(element: string) {
        return srem(this.key, element);
    }
    members() {
        return smembers(this.key);
    }
}
