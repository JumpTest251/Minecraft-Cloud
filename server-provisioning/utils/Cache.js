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

const Cache = function (key, ex = 3600, json = true) {
    this.key = key;
    this.ex = ex;
    this.json = json;
}

Cache.prototype.get = async function (loader) {
    try {
        const data = await get(this.key);
        if (data) return this.json ? JSON.parse(data) : data;

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

Cache.prototype.set = function (value) {
    if (this.ex === 0) {
        return set(this.key, value)
    } else {
        return setex(this.key, this.ex, value);
    }
}

Cache.prototype.clear = function () {
    return del(this.key)
}


const CachedSet = function (key) {
    this.key = key;
}

CachedSet.prototype.add = function (element) {
    return sadd(this.key, element)
}

CachedSet.prototype.contains = function (element) {
    return sismember(this.key, element)
}

CachedSet.prototype.remove = function (element) {
    return srem(this.key, element)
}

CachedSet.prototype.members = function () {
    return smembers(this.key)
}


module.exports.Cache = Cache;
module.exports.CachedSet = CachedSet;