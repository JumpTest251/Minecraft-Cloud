const redis = require('redis');
const { redisUrl } = require('./config');
const { promisify } = require("util");

const client = redis.createClient({ url: redisUrl })
const get = promisify(client.get).bind(client);
const setex = promisify(client.setex).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);
const sadd = promisify(client.sadd).bind(client);
const sismember = promisify(client.sismember).bind(client);
const srem = promisify(client.srem).bind(client);
const smembers = promisify(client.smembers).bind(client);

class Cache {
    constructor(key, ex = 3600, json = true) {
        this.key = key;
        this.ex = ex;
        this.json = json;
    }
    async get(loader) {
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
    set(value) {
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





class CachedSet {
    constructor(key) {
        this.key = key;
    }
    add(element) {
        return sadd(this.key, element);
    }
    contains(element) {
        return sismember(this.key, element);
    }
    remove(element) {
        return srem(this.key, element);
    }
    members() {
        return smembers(this.key);
    }
}





module.exports.Cache = Cache;
module.exports.CachedSet = CachedSet;