import { redisClient } from './redisClient';

export class Cache {
    key: string;
    ex: number;
    json: boolean

    client = redisClient.client;

    constructor(key: string, ex = 3600, json = true) {
        this.key = key;
        this.ex = ex;
        this.json = json;
    }

    async get(loader: (key: string) => Promise<any> | any) {
        try {
            const data = await redisClient.get(this.key);
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
            return redisClient.set(this.key, value);
        } else {
            return redisClient.setex(this.key, this.ex, value);
        }
    }
    clear() {
        return redisClient.del(this.key);
    }
}



export class CachedSet {
    key: string

    client = redisClient.client;

    constructor(key: string) {
        this.key = key;
    }
    add(element: string) {
        return redisClient.sadd(this.key, element);
    }
    contains(element: string) {
        return redisClient.sismember(this.key, element);
    }
    remove(element: string) {
        return redisClient.srem(this.key, element);
    }
    members() {
        return redisClient.smembers(this.key);
    }
}
